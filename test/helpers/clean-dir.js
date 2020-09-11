const rimraf = require('rimraf');

module.exports = function (dir) {
    return new Promise((resolve, reject) => {
        rimraf(dir, err => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });
};
