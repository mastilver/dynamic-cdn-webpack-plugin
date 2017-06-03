# modules-cdn-webpack-plugin [![Build Status](https://travis-ci.org/mastilver/modules-cdn-webpack-plugin.svg?branch=master)](https://travis-ci.org/mastilver/modules-cdn-webpack-plugin)

> Get your dependencies from a cdn rather than bundling them in your app


## Install

```
$ npm install --save modules-cdn-webpack-plugin module-to-cdn
```


## Usage with HtmlWebpackPlugin

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
        new ModulesCdnWebpackPlugin({
            modules: ['react', 'redux', 'react-redux']
        }),
        new HtmlWebpackPlugin()
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
    <script type="text/javascript" src="https://unpkg.com/react@15.5.3/dist/react.min.js"></script><script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/redux/3.6.0/redux.min.js"></script><script type="text/javascript"  src="https://cdnjs.cloudflare.com/ajax/libs/react-redux/5.0.3/react-redux.min.js"></script><script src="build/app.js"></script>
  </body>
</html>
```

## Usage with ManifestPlugin

`webpack.config.js`<br>
```js
const path = require('path');

const ManifestPlugin = require('webpack-manifest-plugin');
const ModulesCdnWebpackPlugin = require('modules-cdn-webpack-plugin');

module.exports = {
    entry: {
        'app': './src/app.js'
    },

    output: {
        path.resolve(__dirname, './build'),
    },

    plugins: [
        new ModulesCdnWebpackPlugin({
            modules: ['react', 'redux', 'react-redux']
        }),
        new ManifestPlugin({
            fileName: 'manifest.json'
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

```json
{
    "app.js": "app.js",
    "react.js": "https://unpkg.com/react@15.5.3/dist/react.min.js",
    "redux.js": "https://cdnjs.cloudflare.com/ajax/libs/redux/3.6.0/redux.min.js",
    "react-redux.js": "https://cdnjs.cloudflare.com/ajax/libs/react-redux/5.0.3/react-redux.min.js"
}
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
