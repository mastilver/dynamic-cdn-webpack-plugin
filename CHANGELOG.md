# CHANGELOG


## 3.3.0 (July 26, 2017)

### features

- able to use a custom resolver ([#26](https://github.com/mastilver/dynamic-cdn-webpack-plugin/pull/26))

### fixes

- do not include module if peers dependencies failed ([7257b5f](https://github.com/mastilver/dynamic-cdn-webpack-plugin/commit/7257b5ffd12a3213077c096f51e77f6a1742ae56))

> Note: the module was rename to dynamic-cdn-webpack-plugin


## 3.2.3 (July 20, 2017)

### fixes:

- returns right var name in all cases (adcd2b9)


## 3.2.2 (July 19, 2017)

### fixes:

- use correct module when using multiple modules versions ([#25](https://github.com/mastilver/dynamic-cdn-webpack-plugin/pull/25))
- add webpack@3 to peerDependencies (ed1e72a)


## 3.2.1 (July 19, 2017)

### fixes:

- able to require a file inside a module ([#20](https://github.com/mastilver/dynamic-cdn-webpack-plugin/pull/20))


## 3.2.0 (July 2, 2017)

### features:

- add verbose mode (fb79805)


## 3.1.0 (July 2, 2017)

### features:

- add 'only'/'exclude' options (713d74f)
