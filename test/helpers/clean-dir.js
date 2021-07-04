const rimraf = require('rimraf');

module.exports = function cleanDir(dir) {
    return new Promise((resolve, reject) => {
        rimraf(dir, error => {
            if (error) return reject(error);
            resolve();
        });
    });
}
