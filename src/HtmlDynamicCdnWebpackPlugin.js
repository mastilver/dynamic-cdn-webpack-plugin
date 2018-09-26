import HtmlWebpackPlugin from "html-webpack-plugin";
import HtmlWebpackIncludeAssetsPlugin from "html-webpack-include-assets-plugin";

import DynamicCdnWebpackPlugin, { pluginName } from "./DynamicCdnWebpackPlugin";

export default class HtmlDynamicCdnWebpackPlugin extends DynamicCdnWebpackPlugin {
    output(compiler) {
        const includeAssetsPlugin = new HtmlWebpackIncludeAssetsPlugin({
            assets: [],
            publicPath: "",
            append: false
        });

        includeAssetsPlugin.apply(compiler);

        compiler.hooks.afterCompile.tapAsync(pluginName, (compilation, cb) => {
            const assets = Object.values(this.modulesFromCdn).map(
                moduleFromCdn => moduleFromCdn.url
            );

            // HACK: Calling the constructor directly is not recomended
            //       But that's the only secure way to edit `assets` afterhand
            includeAssetsPlugin.constructor({
                assets,
                publicPath: "",
                append: false
            });

            cb();
        });
    }
}
