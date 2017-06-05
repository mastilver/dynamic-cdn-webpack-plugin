import moduleToCdn from 'module-to-cdn';
import {sync as readPkg} from 'read-pkg';
import HtmlWebpackIncludeAssetsPlugin from 'html-webpack-include-assets-plugin';
import ExternalModule from 'webpack/lib/ExternalModule';
import resolvePkg from 'resolve-pkg';

let HtmlWebpackPlugin;
try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    HtmlWebpackPlugin = require('html-webpack-plugin');
} catch (err) {
    HtmlWebpackPlugin = null;
}

export default class ModulesCdnWebpackPlugin {
    constructor({disable = false, env} = {}) {
        this.disable = disable;
        this.env = env || process.env.NODE_ENV || 'development';
        this.urls = {};
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
        compiler.plugin('normal-module-factory', nmf => {
            nmf.plugin('factory', factory => (data, cb) => {
                const dependency = data.dependencies[0];

                if (/\/|\\/.test(dependency.request)) {
                    return factory(data, cb);
                }

                const moduleName = dependency.request;

                const {version} = readPkg(resolvePkg(moduleName, {cwd: data.context}));

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
