const path = require('path');
const {fs} = require('mz');
const t = require('tap');

const DynamicCdnWebpackPlugin = require('..');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');

const runWebpack = require('./helpers/run-webpack.js');
const cleanDir = require('./helpers/clean-dir.js');

t.test('webpack-manifest-plugin', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/webpack-manifest-plugin'));

    await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/webpack-manifest-plugin')
        },

        entry: {
            app: './single.js'
        },

        plugins: [
            new WebpackManifestPlugin({fileName: 'manifest.json'}),
            new DynamicCdnWebpackPlugin()
        ]
    });

    const manifest = JSON.parse(await fs.readFile(path.resolve(__dirname, './fixtures/output/webpack-manifest-plugin/manifest.json')));

    t.same(manifest, {
        'app.js': 'app.js',
        'react.js': 'https://unpkg.com/react@15.6.1/dist/react.js'
    });

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/webpack-manifest-plugin/app.js'));

    // NOTE: not inside t.notOk to prevent ava to display whole file in console
    const doesIncludeReact = output.includes('PureComponent');
    t.notOk(doesIncludeReact);
});
