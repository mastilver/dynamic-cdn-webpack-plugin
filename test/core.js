import path from 'path';
import fs from 'mz/fs';

import test from 'ava';

import ModulesCdnWebpackPlugin from '../src';

import runWebpack from './helpers/run-webpack';
import cleanDir from './helpers/clean-dir';

test('basic', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/basic'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/basic'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/basic')
        },

        entry: {
            app: './index.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin({
                modules: ['react']
            })
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.true(files.includes('app.js'));
    t.true(files.includes('https://unpkg.com/react@15.5.4/dist/react.min.js'));

    const externals = stats.compilation.options.externals;
    t.deepEqual(externals, {react: 'React'});

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/basic/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = output.includes('PureComponent');
    t.false(doesIncludeReact);
});
