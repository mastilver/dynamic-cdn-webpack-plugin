import readPkgUp from 'read-pkg-up';
import HtmlWebpackIncludeAssetsPlugin from 'html-webpack-include-assets-plugin';
import ExternalModule from 'webpack/lib/ExternalModule';
import resolvePkg from 'resolve-pkg';
import includes from 'babel-runtime/core-js/array/includes';

import getResolver from './get-resolver';

const pluginName = 'dynamic-cdn-webpack-plugin';
let HtmlWebpackPlugin;
try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    HtmlWebpackPlugin = require('html-webpack-plugin');
} catch (err) {
    HtmlWebpackPlugin = null;
}

const moduleRegex = /^((?:@[a-z0-9][\w-.]+\/)?[a-z0-9][\w-.]*)/;

export default class DynamicCdnWebpackPlugin {
    constructor({disable = false, env, exclude, only, verbose, resolver} = {}) {
        if (exclude && only) {
            throw new Error('You can\'t use \'exclude\' and \'only\' at the same time');
        }

        this.disable = disable;
        this.env = env || process.env.NODE_ENV || 'development';
        this.exclude = exclude || [];
        this.only = only || null;
        this.verbose = verbose === true;
        this.resolver = getResolver(resolver);

        this.modulesFromCdn = {};
    }

    apply(compiler) {
        if (!this.disable) {
            this.execute(compiler, {env: this.env});
        }

        const isUsingHtmlWebpackPlugin = HtmlWebpackPlugin != null && compiler.options.plugins.some(x => x instanceof HtmlWebpackPlugin);

        if (isUsingHtmlWebpackPlugin) {
            this.applyHtmlWebpackPlugin(compiler);
        } else {
            this.applyWebpackCore(compiler);
        }
    }

    execute(compiler, {env}) {
        compiler.hooks.normalModuleFactory.tap(pluginName, nmf => {
            nmf.hooks.factory.tap(pluginName, factory => async (data, cb) => {
                const modulePath = data.dependencies[0].request;
                const contextPath = data.context;

                const isModulePath = moduleRegex.test(modulePath);
                if (!isModulePath) {
                    return factory(data, cb);
                }

                const varName = await this.addModule(contextPath, modulePath, {env});

                if (varName === false) {
                    factory(data, cb);
                } else if (varName == null) {
                    cb(null);
                } else {
                    cb(null, new ExternalModule(varName, 'var', modulePath));
                }
            });
        });
    }

    async addModule(contextPath, modulePath, {env}) {
        const isModuleExcluded = includes(this.exclude, modulePath) ||
            (this.only && !includes(this.only, modulePath));
        if (isModuleExcluded) {
            return false;
        }

        const moduleName = modulePath.match(moduleRegex)[1];
        const {pkg: {version, peerDependencies}} = await readPkgUp({cwd: resolvePkg(moduleName, {cwd: contextPath})});

        const isModuleAlreadyLoaded = Boolean(this.modulesFromCdn[modulePath]);
        if (isModuleAlreadyLoaded) {
            const isSameVersion = this.modulesFromCdn[modulePath].version === version;
            if (isSameVersion) {
                return this.modulesFromCdn[modulePath].var;
            }

            return false;
        }

        const cdnConfig = await this.resolver(modulePath, version, {env});

        if (cdnConfig == null) {
            if (this.verbose) {
                console.log(`❌ '${modulePath}' couldn't be found, please add it to https://github.com/mastilver/module-to-cdn/blob/master/modules.json`);
            }
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

            if (!arePeerDependenciesLoaded) {
                return false;
            }
        }

        this.modulesFromCdn[modulePath] = cdnConfig;

        return cdnConfig.var;
    }

    applyWebpackCore(compiler) {
        compiler.hooks.afterCompile.tapAsync(pluginName, (compilation, cb) => {
            for (const [name, cdnConfig] of Object.entries(this.modulesFromCdn)) {
                compilation.addChunkInGroup(name);
                const chunk = compilation.addChunk(name);
                chunk.files.push(cdnConfig.url);
            }

            cb();
        });
    }

    applyHtmlWebpackPlugin(compiler) {
        const includeAssetsPlugin = new HtmlWebpackIncludeAssetsPlugin({
            assets: [],
            publicPath: '',
            append: false
        });

        includeAssetsPlugin.apply(compiler);

        compiler.hooks.afterCompile.tapAsync(pluginName, (compilation, cb) => {
            const assets = Object.values(this.modulesFromCdn).map(moduleFromCdn => moduleFromCdn.url);

            // HACK: Calling the constructor directly is not recomended
            //       But that's the only secure way to edit `assets` afterhand
            includeAssetsPlugin.constructor({
                assets,
                publicPath: '',
                append: false
            });

            cb();
        });
    }
}
