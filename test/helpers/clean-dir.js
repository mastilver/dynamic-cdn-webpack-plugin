import rimraf from 'rimraf';

export default function cleanDir(dir) {
    return new Promise((resolve, reject) => {
        rimraf(dir, error => {
            if (error) return reject(error);
            resolve();
        });
    });
}
