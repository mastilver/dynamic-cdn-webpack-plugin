const path = require('path');
const fs = require('fs');

const test = require('ava');
const ManifestPlugin = require('webpack-manifest-plugin');

import DynamicCdnWebpackPlugin from '../lib';

const runWebpack = require('./helpers/run-webpack');
const cleanDir = require('./helpers/clean-dir');

test('webpack-manifest-plugin', async t => {
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
            new ManifestPlugin({
                fileName: 'manifest.json'
            }),
            new DynamicCdnWebpackPlugin()
        ]
    });

    const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, './fixtures/output/webpack-manifest-plugin/manifest.json')));

    t.deepEqual(manifest, {
        'app.js': 'app.js',
        'react.js': 'https://unpkg.com/react@15.6.1/dist/react.js'
    });

    const output = fs.readFileSync(path.resolve(__dirname, './fixtures/output/webpack-manifest-plugin/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = output.includes('PureComponent');
    t.false(doesIncludeReact);
});
