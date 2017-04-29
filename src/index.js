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

        const warnings = [];

        const cdnConfigs = modules.map(name => {
            if (!packageJson.dependencies[name]) {
                warnings.push(new Error(`Tried to use a CDN for ${name} but it's not present in your dependencies`));
                return null;
            }

            const {version} = readPkg(path.join(projectPath, 'node_modules', name));

            const cdnConfig = moduleToCdn(name, version);

            if (cdnConfig == null) {
                warnings.push(new Error(`'${name}' is not available through cdn, add it to https://github.com/mastilver/module-to-cdn/blob/master/modules.json if you think it should`));
            }

            return cdnConfig;
        }).filter(x => Boolean(x));

        super(cdnConfigs);

        this.warnings = warnings;
    }

    apply(compiler) {
        compiler.plugin('compilation', compilation => {
            compilation.warnings = compilation.warnings.concat(this.warnings);
        });
    }
}
