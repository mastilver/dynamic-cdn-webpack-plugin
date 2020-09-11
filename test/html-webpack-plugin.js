import path from 'path';
import fs from 'fs';

import test from 'ava';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import DynamicCdnWebpackPlugin from '../lib';

import runWebpack from './helpers/run-webpack';
import cleanDir from './helpers/clean-dir';

test('html-webpack-plugin', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/html-webpack-plugin'));

    await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '/',
            path: path.resolve(__dirname, './fixtures/output/html-webpack-plugin')
        },

        entry: {
            app: './single.js'
        },

        plugins: [
            new HtmlWebpackPlugin(),
            new DynamicCdnWebpackPlugin()
        ]
    });

    const indexFile = fs.readFileSync(path.resolve(__dirname, './fixtures/output/html-webpack-plugin/index.html'), {encoding: 'utf-8'});

    t.true(indexFile.includes('src="/app.js"'));
    t.true(indexFile.includes('src="https://unpkg.com/react@15.6.1/dist/react.js"'));

    const output = fs.readFileSync(path.resolve(__dirname, './fixtures/output/html-webpack-plugin/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = output.includes('PureComponent');
    t.false(doesIncludeReact);
});
