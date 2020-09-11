import rimraf from 'rimraf';

export default function cleanDir(dir) {
    return new Promise((resolve, reject) => {
        rimraf(dir, err => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });
}
