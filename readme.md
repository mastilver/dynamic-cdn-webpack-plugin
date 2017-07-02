# modules-cdn-webpack-plugin [![Build Status](https://travis-ci.org/mastilver/modules-cdn-webpack-plugin.svg?branch=master)](https://travis-ci.org/mastilver/modules-cdn-webpack-plugin)

> Dynamically get your dependencies from a cdn rather than bundling them in your app


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
        new HtmlWebpackPlugin(),
        new ModulesCdnWebpackPlugin()
    ]
}
```

`app.js`<br>
```js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// ... do react stuff
```

`NODE_ENV=production webpack` will generate:

```js
/* simplified webpack build */
[function(module, __webpack_exports__, __webpack_require__) {
    module.exports = React;
}),
(function(module, __webpack_exports__, __webpack_require__) {
    module.exports = ReactRouterDOM;
}),
(function(module, __webpack_exports__, __webpack_require__) {
    var react = __webpack_require__(0);
    var reactRouterDOM = __webpack_require__(1);

    /* ... */
})]
```

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Webpack App</title>
  </head>
  <body>
    <script type="text/javascript" src="https://unpkg.com/react@15.5.3/dist/react.min.js"></script><script type="text/javascript" src="https://unpkg.com/react-router-dom@4.1.1/umd/react-router-dom.min.js"></script><script src="build/app.js"></script></body>
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
        new ManifestPlugin({
            fileName: 'manifest.json'
        }),
        new ModulesCdnWebpackPlugin()
    ]
}
```

`app.js`<br>
```js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// ... do react stuff
```

`NODE_ENV=production webpack` will generate:

```js
/* simplified webpack build */
[function(module, __webpack_exports__, __webpack_require__) {
    module.exports = React;
}),
(function(module, __webpack_exports__, __webpack_require__) {
    module.exports = ReactRouterDOM;
}),
(function(module, __webpack_exports__, __webpack_require__) {
    var react = __webpack_require__(0);
    var reactRouterDOM = __webpack_require__(1);

    /* ... */
})]
```

```json
{
    "app.js": "app.js",
    "react.js": "https://unpkg.com/react@15.5.3/dist/react.min.js",
    "react-router-dom.js": "https://unpkg.com/react-router-dom@4.1.1/umd/react-router-dom.min.js"
}
```


## API

### ModulesCdnWebpackPlugin(options)

#### options.disable

Type: `boolean`<br>
Default: `false`

Usefull when working offline, will fallbacl to webpack normal behaviour

#### options.env

Type: `string`<br>
Default: `process.env.NODE_ENV || 'development'`<br>
Values: `development`, `production`

Determine if it should load the development or the production version of modules


## Related

- [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)
- [module-to-cdn](https://github.com/mastilver/module-to-cdn)


## License

MIT © [Thomas Sileghem](http://mastilver.com)
