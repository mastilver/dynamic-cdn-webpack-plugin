# modules-cdn-webpack-plugin [![Build Status](https://travis-ci.org/mastilver/modules-cdn-webpack-plugin.svg?branch=master)](https://travis-ci.org/mastilver/modules-cdn-webpack-plugin) [![codecov](https://codecov.io/gh/mastilver/modules-cdn-webpack-plugin/badge.svg?branch=master)](https://codecov.io/gh/mastilver/modules-cdn-webpack-plugin?branch=master)

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

#### options.only

Type: `Array<string>`
Default: `null`

List the only modules that should be served by the cdn


#### options.exclude

Type: `Array<string>`
Default: `[]`

List the modules that will always be bundled (not be served by the cdn)

#### options.verbose

Type: `boolean`<br>
Default: `false`

Log whether the library is being served by the cdn or is bundled

## Related

- [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)
- [module-to-cdn](https://github.com/mastilver/module-to-cdn)


## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars3.githubusercontent.com/u/4112409?v=4" width="100px;"/><br /><sub>Thomas Sileghem</sub>](https://github.com/mastilver)<br />[💻](https://github.com/mastilver/modules-cdn-webpack-plugin/commits?author=mastilver "Code") [📖](https://github.com/mastilver/modules-cdn-webpack-plugin/commits?author=mastilver "Documentation") [⚠️](https://github.com/mastilver/modules-cdn-webpack-plugin/commits?author=mastilver "Tests") | [<img src="https://avatars0.githubusercontent.com/u/92839?v=4" width="100px;"/><br /><sub>MICHAEL JACKSON</sub>](https://twitter.com/mjackson)<br />[💡](https://github.com/unpkg/unpkg-demos "Examples") |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!


## License

MIT © [Thomas Sileghem](http://mastilver.com)
