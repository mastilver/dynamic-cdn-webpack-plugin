# modules-cdn-webpack-plugin [![Build Status](https://travis-ci.org/mastilver/modules-cdn-webpack-plugin.svg?branch=master)](https://travis-ci.org/mastilver/modules-cdn-webpack-plugin)

> Get your dependencies from a cdn rather than bundling them in your app


## Install

```
$ npm install --save modules-cdn-webpack-plugin module-to-cdn
```


## Usage

`webpack.config.js`<br>
```js
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModulesCdnWebpackPlugin = require('modules-cdn-webpack-plugin');

module.exports = {
    entry: {
        'app.js': './src/app.js'
    },

    output: {
        path.resolve(__dirname, './build'),
    },

    plugins: [
        new HtmlWebpackPlugin(),
        new ModulesCdnWebpackPlugin({
            modules: ['react', 'redux', 'react-redux']
        })
    ]
}
```

`app.js`<br>
```js
const React = require('react');

// ... do react stuff
```

Will generate:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Webpack App</title>
  </head>
  <body>
    <script type="text/javascript" src="https://unpkg.com/react@15.5.3/dist/react.min.js"><script src="build/app.js"></script>
  </body>
</html>
```


## API

### ModulesCdnWebpackPlugin(options)

#### options.modules

Type: `Array<string>`

Names of module that will use cdn

#### options.disable

Type: `boolean`<br>
Default: `false`

Usefull when working offline, will fallbacl to webpack normal behaviour


## Related

- [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)
- [module-to-cdn](https://github.com/mastilver/module-to-cdn)


## License

MIT © [Thomas Sileghem](http://mastilver.com)
