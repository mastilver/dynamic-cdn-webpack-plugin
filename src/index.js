import path from 'path';

import moduleToCdn from 'module-to-cdn';
import parent from 'parent-module';
import {sync as findUp} from 'find-up';
import {sync as readPkg} from 'read-pkg';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackIncludeAssetsPlugin from 'html-webpack-include-assets-plugin';

export default class ModulesCdnWebpackPlugin {
    constructor({modules = [], disable = false, env}) {
        if (disable) {
            modules = [];
        }

        this.modules = modules;
        this.env = env || process.env.NODE_ENV || 'development';
    }

    apply(compiler) {
        const context = compiler.options.context || path.dirname(parent());

        const {warnings, externals, urls} = this.execute({context, modules: this.modules, env: this.env});

        compiler.options.externals = Object.assign({}, compiler.options.externals, externals);

        const isUsingHtmlWebpackPlugin = compiler.options.plugins.find(x => x instanceof HtmlWebpackPlugin);

        if (isUsingHtmlWebpackPlugin) {
            this.applyHtmlWebpackPlugin(compiler, {urls});
        } else {
            this.applyWebpackCore(compiler, {urls});
        }

        compiler.plugin('compilation', compilation => {
            compilation.warnings = compilation.warnings.concat(warnings);
        });
    }

    applyWebpackCore(compiler, {urls}) {
        compiler.plugin('after-compile', (compilation, cb) => {
            const entrypoint = compilation.entrypoints[Object.keys(compilation.entrypoints)[0]];
            const parentChunk = entrypoint.chunks.find(x => x.isInitial());

            for (const name of Object.keys(urls)) {
                const url = urls[name];

                const chunk = compilation.addChunk(name);
                chunk.files.push(url);

                chunk.parents = [parentChunk];
                parentChunk.addChunk(chunk);
                entrypoint.insertChunk(chunk, parentChunk);
            }

            cb();
        });
    }

    applyHtmlWebpackPlugin(compiler, {urls}) {
        const assets = Object.values(urls);

        const includeAssetsPlugin = new HtmlWebpackIncludeAssetsPlugin({
            assets,
            publicPath: '',
            append: false
        });

        includeAssetsPlugin.apply(compiler);
    }

    execute({context, modules, env}) {
        const packageJsonPath = findUp('package.json', {
            cwd: context
        });
        const projectPath = path.dirname(packageJsonPath);
        const packageJson = readPkg(packageJsonPath);

        const warnings = [];
        const urls = {};
        const externals = {};

        for (const name of modules) {
            if (!packageJson.dependencies[name]) {
                warnings.push(new Error(`Tried to use a CDN for ${name} but it's not present in your dependencies`));
                continue;
            }

            const {version} = readPkg(path.join(projectPath, 'node_modules', name));

            const cdnConfig = moduleToCdn(name, version, {env});

            if (cdnConfig == null) {
                warnings.push(new Error(`'${name}' is not available through cdn, add it to https://github.com/mastilver/module-to-cdn/blob/master/modules.json if you think it should`));
                continue;
            }

            externals[cdnConfig.name] = cdnConfig.var;
            urls[cdnConfig.name] = cdnConfig.url;
        }

        return {
            warnings,
            urls,
            externals
        };
    }
}
