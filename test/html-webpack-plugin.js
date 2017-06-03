import path from 'path';
import fs from 'mz/fs';

import test from 'ava';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import ModulesCdnWebpackPlugin from '../src';

import runWebpack from './helpers/run-webpack';
import cleanDir from './helpers/clean-dir';

test('html-webpack-plugin', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/html-webpack-plugin'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/html-webpack-plugin'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/html-webpack-plugin')
        },

        entry: {
            app: './index.js'
        },

        plugins: [
            new HtmlWebpackPlugin(),
            new ModulesCdnWebpackPlugin({
                modules: ['react']
            })
        ]
    });

    const indexFile = await fs.readFile(path.resolve(__dirname, './fixtures/output/html-webpack-plugin/index.html'), {encoding: 'utf-8'});

    t.true(indexFile.includes('src="app.js"'));
    t.true(indexFile.includes('src="https://unpkg.com/react@15.5.4/dist/react.min.js"'));

    const externals = stats.compilation.options.externals;
    t.deepEqual(externals, {react: 'React'});

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/html-webpack-plugin/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = output.includes('PureComponent');
    t.false(doesIncludeReact);
});
