import path from 'path';
import fs from 'mz/fs';

import test from 'ava';
import webpack from 'webpack';

import DynamicCdnWebpackPlugin from '../src';

import runWebpack from './helpers/run-webpack';
import cleanDir from './helpers/clean-dir';

process.env.NODE_ENV = 'development';

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
            new DynamicCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(files.includes('app.js'));
    t.true(files.includes('https://unpkg.com/react@15.6.1/dist/react.js'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/basic/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = output.includes('THIS IS REACT!');
    t.false(doesIncludeReact);

    const doesRequireReact = output.includes('module.exports = React');
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
            new DynamicCdnWebpackPlugin({
                env: 'production'
            })
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(files.includes('app.js'));
    t.true(files.includes('https://unpkg.com/react@15.6.1/dist/react.min.js'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/env-prod/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = output.includes('THIS IS REACT!');
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
            new DynamicCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(files.includes('app.js'));
    t.true(files.includes('https://unpkg.com/react@15.6.1/dist/react.min.js'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/node-env-prod/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = output.includes('THIS IS REACT!');
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
            new DynamicCdnWebpackPlugin()
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
            new DynamicCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 4);
    t.true(files.includes('app.js'));
    t.true(files.includes('https://unpkg.com/@angular/core@4.2.4/bundles/core.umd.js'));
    t.true(files.includes('https://unpkg.com/rxjs@5.4.1/bundles/Rx.js'));
    t.true(files.includes('https://unpkg.com/zone.js@0.8.12/dist/zone.js'));
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
            new DynamicCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(files.includes('app.js'));
    t.true(files.includes('https://unpkg.com/babel-polyfill@6.23.0/dist/polyfill.js'));
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
            new DynamicCdnWebpackPlugin({
                exclude: ['react']
            })
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 1);
    t.true(files.includes('app.js'));
    t.false(files.includes('https://unpkg.com/react@15.6.1/dist/react.js'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/exclude/app.js'));

    // NOTE: not inside t.true to prevent ava to display whole file in console
    const doesIncludeReact = output.includes('THIS IS REACT!');
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
            new DynamicCdnWebpackPlugin({
                only: ['react']
            })
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(files.includes('app.js'));
    t.true(files.includes('https://unpkg.com/react@15.6.1/dist/react.js'));
    t.false(files.includes('https://unpkg.com/babel-polyfill@6.23.0/dist/polyfill.js'));
    t.false(files.includes('https://unpkg.com/react-dom@15.6.1/dist/react-dom.js'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/only/app.js'));

    // NOTE: not inside t.true to prevent ava to display whole file in console
    const doesIncludeReactDom = output.includes('THIS IS REACT DOM!');
    t.true(doesIncludeReactDom);

    const doesIncludeBabelPolyfill = output.includes('THIS IS BABEL POLYFILL!');
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
            new DynamicCdnWebpackPlugin({
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
            new DynamicCdnWebpackPlugin({
                verbose: true
            })
        ]
    });

    t.true(logs.includes('✔️ \'react\' will be served by https://unpkg.com/react@15.6.1/dist/react.js'));
    t.true(logs.includes('❌ \'a\' couldn\'t be found, please add it to https://github.com/mastilver/module-to-cdn/blob/master/modules.json'));

    console.log = originalLog;
});

test('require files without extension', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/require-file'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/require-file')
        },

        entry: {
            app: './require-file.js'
        },

        plugins: [
            new DynamicCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 1);
    t.true(files.includes('app.js'));
    t.false(files.includes('https://unpkg.com/react@15.6.1/dist/react.js'));
});

test('async loading', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/async'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/async')
        },

        entry: {
            app: './async.js'
        },

        plugins: [
            new DynamicCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.true(files.includes('app.js'));
    t.true(files.includes('https://unpkg.com/react@15.6.1/dist/react.js'));

    const outputs = await Promise.all(files.filter(x => !x.startsWith('https://unpkg.com')).map(async file => {
        return fs.readFile(path.resolve(__dirname, `./fixtures/output/async/${file}`));
    }));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = outputs.some(output => output.includes('THIS IS REACT!'));
    t.false(doesIncludeReact);
});

test('when using multiple versions of a module, make sure the right version is used for each', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/multiple-versions'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/multiple-versions')
        },

        entry: {
            app: './mix.js'
        },

        plugins: [
            new DynamicCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.true(files.includes('app.js'));
    t.true(files.includes('https://unpkg.com/react@15.6.1/dist/react.js'));

    let output = await fs.readFile(path.resolve(__dirname, './fixtures/output/multiple-versions/app.js'));
    output = output.toString();

    const numberOfExports = output.match(/module\.exports =/g).length;
    t.is(numberOfExports, 1);

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact14 = output.includes('THIS IS REACT@0.14.9!');
    t.true(doesIncludeReact14);

    const doesIncludeReact = output.includes('THIS IS REACT!');
    t.false(doesIncludeReact);
});

test('when using a custom resolver', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/custom-resolver'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/custom-resolver')
        },

        entry: {
            app: './single.js'
        },

        plugins: [
            new DynamicCdnWebpackPlugin({
                resolver: () => {
                    return {
                        var: 'CustomReact',
                        name: 'react',
                        url: 'https://my-cdn.com/react.js',
                        version: '15.0.0'
                    };
                }
            })
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.true(files.includes('app.js'));
    t.true(files.includes('https://my-cdn.com/react.js'));

    let output = await fs.readFile(path.resolve(__dirname, './fixtures/output/custom-resolver/app.js'));
    output = output.toString();

    const doesExportCustomReact = output.includes('module.exports = CustomReact');
    t.true(doesExportCustomReact);

    const doesIncludeReact = output.includes('THIS IS REACT!');
    t.false(doesIncludeReact);
});

test('when one peerDependency fails, do not load from cdn', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/failing-peer-dependency'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/failing-peer-dependency')
        },

        entry: {
            app: './peer-dependencies.js'
        },

        plugins: [
            new DynamicCdnWebpackPlugin({
                resolver: name => {
                    return {
                        '@angular/core': {
                            var: 'ng',
                            name: 'angular',
                            url: 'https://unpkg.com/@angular/core@4.2.4/bundles/core.umd.js',
                            version: '4.2.4'
                        },
                        rxjs: {
                            var: 'Rx',
                            name: 'rxjs',
                            url: 'https://unpkg.com/rxjs@5.4.1/bundles/Rx.js',
                            version: '5.4.1'
                        }
                    }[name];
                }
            })
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(files.includes('app.js'));
    t.false(files.includes('https://unpkg.com/@angular/core@4.2.4/bundles/core.umd.js'));
    t.true(files.includes('https://unpkg.com/rxjs@5.4.1/bundles/Rx.js'));
    t.false(files.includes('https://unpkg.com/zone.js@0.8.12/dist/zone.js'));

    let output = await fs.readFile(path.resolve(__dirname, './fixtures/output/failing-peer-dependency/app.js'));
    output = output.toString();

    const doesIncludeAngular = output.includes('console.log(\'THIS IS ANGULAR!\');');
    t.true(doesIncludeAngular);
});

test('when resolver retuns a Promise', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/custom-resolver'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/custom-resolver')
        },

        entry: {
            app: './single.js'
        },

        plugins: [
            new DynamicCdnWebpackPlugin({
                resolver: () => new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            var: 'CustomReact',
                            name: 'react',
                            url: 'https://my-cdn.com/react.js',
                            version: '15.0.0'
                        });
                    }, 200);
                })
            })
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.true(files.includes('app.js'));
    t.true(files.includes('https://my-cdn.com/react.js'));

    let output = await fs.readFile(path.resolve(__dirname, './fixtures/output/custom-resolver/app.js'));
    output = output.toString();

    const doesExportCustomReact = output.includes('module.exports = CustomReact');
    t.true(doesExportCustomReact);

    const doesIncludeReact = output.includes('THIS IS REACT!');
    t.false(doesIncludeReact);
});

test('when used with NamedModulesPlugin', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/named-modules'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/named-modules')
        },

        entry: {
            app: './single.js'
        },

        plugins: [
            new DynamicCdnWebpackPlugin(),
            new webpack.NamedModulesPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 2);
    t.true(files.includes('app.js'));
    t.true(files.includes('https://unpkg.com/react@15.6.1/dist/react.js'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/named-modules/app.js'));

    const doesHaveIncorrectRequire = output.includes('__webpack_require__(undefined)');
    t.false(doesHaveIncorrectRequire);

    const doesHaveCorrectReactRequire = output.includes('__webpack_require__(/*! react */ \\"react\\")');
    t.true(doesHaveCorrectReactRequire);
});

test('When module contains a submodule', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/submodule'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/app'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/submodule')
        },

        entry: {
            app: './submodule.js'
        },

        plugins: [
            new DynamicCdnWebpackPlugin()
        ]
    });

    const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

    t.is(files.length, 1);
    t.true(files.includes('app.js'));
});
