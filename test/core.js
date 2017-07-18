import path from 'path';
import fs from 'mz/fs';

import test from 'ava';
import includes from 'babel-runtime/core-js/string/includes';

import ModulesCdnWebpackPlugin from '../src';

import runWebpack from './helpers/run-webpack';
import cleanDir from './helpers/clean-dir';

test('basic', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/basic'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/basic')
        },

        entry: {
            app: './single.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(includes(files, 'app.js'));
    t.true(includes(files, 'https://unpkg.com/react@15.6.1/dist/react.js'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/basic/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = includes(output, 'THIS IS REACT!');
    t.false(doesIncludeReact);

    const doesRequireReact = includes(output, 'module.exports = React');
    t.true(doesRequireReact);
});

test('using production version', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/env-prod'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/env-prod')
        },

        entry: {
            app: './single.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin({
                env: 'production'
            })
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(includes(files, 'app.js'));
    t.true(includes(files, 'https://unpkg.com/react@15.6.1/dist/react.min.js'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/env-prod/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = includes(output, 'THIS IS REACT!');
    t.false(doesIncludeReact);
});

test.serial('with NODE_ENV=production', async t => {
    process.env.NODE_ENV = 'production';

    await cleanDir(path.resolve(__dirname, './fixtures/output/node-env-prod'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/node-env-prod')
        },

        entry: {
            app: './single.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(includes(files, 'app.js'));
    t.true(includes(files, 'https://unpkg.com/react@15.6.1/dist/react.min.js'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/node-env-prod/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = includes(output, 'THIS IS REACT!');
    t.false(doesIncludeReact);

    delete process.env.NODE_ENV;
});

test('nested dependencies', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/nested-dependencies'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/nested-dependencies'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/nested-dependencies')
        },

        entry: {
            app: './index.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.deepEqual(files, ['app.js']);
});

test('peerDependencies', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/peer-dependencies'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/peer-dependencies')
        },

        entry: {
            app: './peer-dependencies.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 4);
    t.true(includes(files, 'app.js'));
    t.true(includes(files, 'https://unpkg.com/@angular/core@4.2.4/bundles/core.umd.js'));
    t.true(includes(files, 'https://unpkg.com/rxjs@5.4.1/bundles/Rx.js'));
    t.true(includes(files, 'https://unpkg.com/zone.js@0.8.12/dist/zone.js'));
});

test('load module without export', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/no-export'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/no-export')
        },

        entry: {
            app: './no-export.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(includes(files, 'app.js'));
    t.true(includes(files, 'https://unpkg.com/babel-polyfill@6.23.0/dist/polyfill.js'));
});

test('exclude some modules', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/exclude'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/exclude')
        },

        entry: {
            app: './single.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin({
                exclude: ['react']
            })
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 1);
    t.true(includes(files, 'app.js'));
    t.false(includes(files, 'https://unpkg.com/react@15.6.1/dist/react.js'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/exclude/app.js'));

    // NOTE: not inside t.true to prevent ava to display whole file in console
    const doesIncludeReact = includes(output, 'THIS IS REACT!');
    t.true(doesIncludeReact);
});

test('only include some modules', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/only'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/only')
        },

        entry: {
            app: './multiple.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin({
                only: ['react']
            })
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(includes(files, 'app.js'));
    t.true(includes(files, 'https://unpkg.com/react@15.6.1/dist/react.js'));
    t.false(includes(files, 'https://unpkg.com/babel-polyfill@6.23.0/dist/polyfill.js'));
    t.false(includes(files, 'https://unpkg.com/react-dom@15.6.1/dist/react-dom.js'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/only/app.js'));

    // NOTE: not inside t.true to prevent ava to display whole file in console
    const doesIncludeReactDom = includes(output, 'THIS IS REACT DOM!');
    t.true(doesIncludeReactDom);

    const doesIncludeBabelPolyfill = includes(output, 'THIS IS BABEL POLYFILL!');
    t.true(doesIncludeBabelPolyfill);
});

test('errors when using \'only\' and \'exclude\' together', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/error'));

    t.throws(() => runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/error')
        },

        entry: {
            app: './single.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin({
                exclude: ['react'],
                only: ['react']
            })
        ]
    }), /You can't use 'exclude' and 'only' at the same time/);
});

test.serial('verbose options to output which modules are loaded from CDN / which are bundled', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/verbose'));

    const logs = [];

    const originalLog = console.log;
    console.log = log => {
        logs.push(log);
    };

    await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/verbose')
        },

        entry: {
            app: './mix.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin({
                verbose: true
            })
        ]
    });

    t.snapshot(logs);

    console.log = originalLog;
});
