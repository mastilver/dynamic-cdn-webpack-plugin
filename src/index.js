import path from 'path';

import moduleToCdn from 'module-to-cdn';
import parent from 'parent-module';
import {sync as findUp} from 'find-up';
import {sync as readPkg} from 'read-pkg';

export default class ModulesCdnWebpackPlugin {
    constructor({modules = [], disable = false}) {
        if (disable) {
            modules = [];
        }

        this.modules = modules;
    }

    apply(compiler) {
        const context = compiler.options.context || path.dirname(parent());

        const {warnings, externals, urls} = this.execute({context, modules: this.modules});

        compiler.options.externals = Object.assign({}, compiler.options.externals, externals);

        compiler.plugin('emit', (compilation, cb) => {
            const entrypoint = compilation.entrypoints[Object.keys(compilation.entrypoints)[0]];
            const parentChunk = entrypoint.chunks.find(x => x.hasEntryModule());

            for (const url of urls) {
                const chunk = compilation.addChunk();
                chunk.files.push(url);

                chunk.parents = [parentChunk];
                parentChunk.addChunk(chunk);
                entrypoint.insertChunk(chunk, parentChunk);
            }

            compilation.warnings = compilation.warnings.concat(warnings);
            cb();
        });
    }

    execute({context, modules}) {
        const packageJsonPath = findUp('package.json', {
            cwd: context
        });
        const projectPath = path.dirname(packageJsonPath);
        const packageJson = readPkg(packageJsonPath);

        const warnings = [];
        const urls = [];
        const externals = {};

        for (const name of modules) {
            if (!packageJson.dependencies[name]) {
                warnings.push(new Error(`Tried to use a CDN for ${name} but it's not present in your dependencies`));
                continue;
            }

            const {version} = readPkg(path.join(projectPath, 'node_modules', name));

            const cdnConfig = moduleToCdn(name, version);

            if (cdnConfig == null) {
                warnings.push(new Error(`'${name}' is not available through cdn, add it to https://github.com/mastilver/module-to-cdn/blob/master/modules.json if you think it should`));
                continue;
            }

            externals[cdnConfig.name] = cdnConfig.var;
            urls.push(cdnConfig.url);
        }

        return {
            warnings,
            urls,
            externals
        };
    }
}
