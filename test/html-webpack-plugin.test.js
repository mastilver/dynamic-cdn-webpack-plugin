const path = require('path');
const {fs} = require('mz');
const t = require('tap');

const DynamicCdnWebpackPlugin = require('..');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const runWebpack = require('./helpers/run-webpack.js');
const cleanDir = require('./helpers/clean-dir.js');

t.test('html-webpack-plugin', async t => {
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

    const indexFile = await fs.readFile(path.resolve(__dirname, './fixtures/output/html-webpack-plugin/index.html'), {encoding: 'utf-8'});

    t.ok(indexFile.includes('src="/app.js"'));
    t.ok(indexFile.includes('src="https://unpkg.com/react@15.6.1/dist/react.js"'));

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/html-webpack-plugin/app.js'));

    // NOTE: not inside t.notOk to prevent ava to display whole file in console
    const doesIncludeReact = output.includes('PureComponent');
    t.notOk(doesIncludeReact);
});
