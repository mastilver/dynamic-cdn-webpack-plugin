import path from 'path';

import moduleToCdn from 'module-to-cdn';
import parent from 'parent-module';
import {sync as findUp} from 'find-up';
import {sync as readPkg} from 'read-pkg';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackIncludeAssetsPlugin from 'html-webpack-include-assets-plugin';
import ExternalModule from 'webpack/lib/ExternalModule';

export default class ModulesCdnWebpackPlugin {
    constructor({disable = false, env} = {}) {
        this.disable = disable;
        this.env = env || process.env.NODE_ENV || 'development';
        this.urls = {};
    }

    apply(compiler) {
        const context = compiler.options.context || path.dirname(parent());

        if (!this.disable) {
            this.execute(compiler, {context, modules: this.modules, env: this.env});
        }

        const isUsingHtmlWebpackPlugin = compiler.options.plugins.find(x => x instanceof HtmlWebpackPlugin);

        if (isUsingHtmlWebpackPlugin) {
            this.applyHtmlWebpackPlugin(compiler);
        } else {
            this.applyWebpackCore(compiler);
        }
    }

    execute(compiler, {context, env}) {
        const packageJsonPath = findUp('package.json', {
            cwd: context
        });
        const projectPath = path.dirname(packageJsonPath);
        const packageJson = readPkg(packageJsonPath);

        compiler.plugin('normal-module-factory', nmf => {
            nmf.plugin('factory', factory => (data, cb) => {
                const dependency = data.dependencies[0];

                if (/\/|\\/.test(dependency.request)) {
                    return factory(data, cb);
                }

                const moduleName = dependency.request;

                if (!packageJson.dependencies[moduleName]) {
                    return cb(new Error(`Tried to use a CDN for ${moduleName} but it's not present in your dependencies`));
                }

                const {version} = readPkg(path.join(projectPath, 'node_modules', moduleName));

                const cdnConfig = moduleToCdn(moduleName, version, {env});

                if (cdnConfig == null) {
                    return factory(data, cb);
                }

                this.urls[cdnConfig.name] = cdnConfig.url;

                cb(null, new ExternalModule(cdnConfig.var));
            });
        });
    }

    applyWebpackCore(compiler) {
        compiler.plugin('after-compile', (compilation, cb) => {
            const entrypoint = compilation.entrypoints[Object.keys(compilation.entrypoints)[0]];
            const parentChunk = entrypoint.chunks.find(x => x.isInitial());

            for (const name of Object.keys(this.urls)) {
                const url = this.urls[name];

                const chunk = compilation.addChunk(name);
                chunk.files.push(url);

                chunk.parents = [parentChunk];
                parentChunk.addChunk(chunk);
                entrypoint.insertChunk(chunk, parentChunk);
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

        compiler.plugin('after-compile', (compilation, cb) => {
            const assets = Object.values(this.urls);

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
