import webpack from 'webpack';

export default async function (config) {
    return new Promise((resolve, reject) => {
        webpack(config).run((err, stats) => {
            if (err) {
                return reject(err);
            }

            resolve(stats);
        });
    });
}
