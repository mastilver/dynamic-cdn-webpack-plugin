import path from 'path';

import HtmlWebpackExternalsPlugin from 'html-webpack-externals-plugin';
import moduleToCdn from 'module-to-cdn';
import parent from 'parent-module';
import {sync as findUp} from 'find-up';
import {sync as readPkg} from 'read-pkg';

export default class ModulesCdnWebpackPlugin extends HtmlWebpackExternalsPlugin {
    constructor({modules = [], disable = false}) {
        const webpackConfigPath = parent();
        const packageJsonPath = findUp('package.json', {
            cwd: path.dirname(webpackConfigPath)
        });
        const projectPath = path.dirname(packageJsonPath);
        const packageJson = readPkg(packageJsonPath);

        if (disable) {
            modules = [];
        }

        const cdnConfigs = modules.map(module => {
            const isObject = typeof module === 'object';
            const name = isObject ? module.name : module;
            const {version} = readPkg(path.join(projectPath, 'node_modules', name));

            if (isObject) {
                module.url = module.url.replace('[name]', name);
                module.url = module.url.replace('[version]', version);
                return module;
            }

            if (!packageJson.dependencies[name]) {
                throw new Error(`Tried to use a CDN for ${name} but it's not present in your dependencies`);
            }

            return moduleToCdn(name, version);
        });

        super(cdnConfigs);
    }
}
