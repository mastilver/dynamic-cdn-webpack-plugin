const webpack = require('webpack');

module.exports = async function runWebpack(config) {
    if (!config.mode) config.mode = 'development';

    return new Promise((resolve, reject) => {
        webpack(config).run((error, stats) => {
            if (error) return reject(error);

            // TODO: errors more than one error
            if (stats.compilation.errors.length > 0) return reject(stats.compilation.errors[0]);

            resolve(stats);
        });
    });
};
