import readPkgUp from 'read-pkg-up';
import ExternalModule from 'webpack/lib/ExternalModule';
import resolvePkg from 'resolve-pkg';

import getResolver from './get-resolver';

const pluginName = 'dynamic-cdn-webpack-plugin';
let HtmlWebpackPlugin = null;
try {
    HtmlWebpackPlugin = require('html-webpack-plugin');
// eslint-disable-next-line unicorn/prefer-optional-catch-binding
} catch (_) {}

const moduleRegex = /^((?:@[a-z\d][\w-.]+\/)?[a-z\d][\w-.]*)/;

const getEnvironment = mode => {
    switch (mode) {
        case 'none':
        case 'development':
            return 'development';
        default:
            return 'production';
    }
};

export default class DynamicCdnWebpackPlugin {
    constructor({disable = false, env, exclude, only, verbose, resolver} = {}) {
        if (exclude && only) throw new Error('You can\'t use \'exclude\' and \'only\' at the same time');

        this.disable = disable;
        this.env = env;
        this.exclude = exclude || [];
        this.only = only || null;
        this.verbose = verbose === true;
        this.resolver = getResolver(resolver);
        this.modulesFromCdn = {};
    }

    apply(compiler) {
        if (this.disable) return;

        // Find the external modules
        const env = this.env || getEnvironment(compiler.options.mode);
        compiler.hooks.normalModuleFactory.tap(pluginName, nmf => {
            nmf.hooks.resolve.tapPromise(pluginName, async data => {
                const modulePath = data.dependencies[0].request;
                const contextPath = data.context;

                // Unrecognized as a module so use default
                if (!moduleRegex.test(modulePath)) return;

                // Use recognized CDN module if found
                const varName = await this.addModule(contextPath, modulePath, {env});
                return typeof varName === 'string' ? new ExternalModule(varName, 'var', modulePath) : undefined;
            });
        });

        // Make the external modules available to other plugins
        compiler.hooks.compilation.tap(pluginName, compilation => {
            compilation.hooks.beforeModuleAssets.tap(pluginName, () => {
                for (const [name, cdnConfig] of Object.entries(this.modulesFromCdn)) {
                    compilation.addChunkInGroup(name);
                    const chunk = compilation.addChunk(name);
                    chunk.files.add(cdnConfig.url);
                }
            });

            // Optionally, update the HtmlWebpackPlugin assets
            const isUsingHtmlWebpackPlugin = HtmlWebpackPlugin && compiler.options.plugins.some(x => x instanceof HtmlWebpackPlugin);
            if (isUsingHtmlWebpackPlugin) {
                const hooks = HtmlWebpackPlugin.getHooks(compilation);
                hooks.beforeAssetTagGeneration.tapAsync(pluginName, (htmlPluginData, callback) => {
                    const {assets} = htmlPluginData;
                    const scripts = Object.values(this.modulesFromCdn).map(moduleFromCdn => moduleFromCdn.url);
                    assets.js = assets.js.concat(scripts);
                    return callback(null, htmlPluginData);
                });
            }
        });
    }

    async addModule(contextPath, modulePath, {env}) {
        const isModuleExcluded = this.exclude.includes(modulePath) ||
            (this.only && !this.only.includes(modulePath));
        if (isModuleExcluded) return false;

        const moduleName = modulePath.match(moduleRegex)[1];
        const {packageJson: {version, peerDependencies}} = await readPkgUp({cwd: resolvePkg(moduleName, {cwd: contextPath})});

        const isModuleAlreadyLoaded = Boolean(this.modulesFromCdn[modulePath]);
        if (isModuleAlreadyLoaded) {
            const isSameVersion = this.modulesFromCdn[modulePath].version === version;
            return isSameVersion ? this.modulesFromCdn[modulePath].var : false;
        }

        const cdnConfig = await this.resolver(modulePath, version, {env});

        if (cdnConfig == null) {
            if (this.verbose) console.log(`❌ '${modulePath}' couldn't be found, please add it to https://github.com/mastilver/module-to-cdn/blob/master/modules.json`);
            return false;
        }

        if (this.verbose) {
            console.log(`✔️ '${cdnConfig.name}' will be served by ${cdnConfig.url}`);
        }

        if (peerDependencies) {
            const arePeerDependenciesLoaded = (await Promise.all(Object.keys(peerDependencies).map(peerDependencyName => {
                return this.addModule(contextPath, peerDependencyName, {env});
            })))
                .map(x => Boolean(x))
                .reduce((result, x) => result && x, true);

            if (!arePeerDependenciesLoaded) return false;
        }

        this.modulesFromCdn[modulePath] = cdnConfig;
        return cdnConfig.var;
    }
}
