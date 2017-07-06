import path from 'path';
import fs from 'mz/fs';

import test from 'ava';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import includes from 'babel-runtime/core-js/string/includes';

import ModulesCdnWebpackPlugin from '../src';

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
            new ModulesCdnWebpackPlugin()
        ]
    });

    const indexFile = await fs.readFile(path.resolve(__dirname, './fixtures/output/html-webpack-plugin/index.html'), {encoding: 'utf-8'});

    t.true(includes(indexFile, 'src="/app.js"'));
    t.true(includes(indexFile, 'src="https://unpkg.com/react@15.6.1/dist/react.js"'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/html-webpack-plugin/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = includes(output, 'PureComponent');
    t.false(doesIncludeReact);
});
