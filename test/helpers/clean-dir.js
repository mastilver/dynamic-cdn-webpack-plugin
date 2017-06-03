import rimraf from 'rimraf';

export default function (dir) {
    return new Promise((resolve, reject) => {
        rimraf(dir, err => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });
}
