module.exports = function getResolver(resolver) {
    if (typeof resolver === 'function') return resolver;
    if (typeof resolver === 'string') return require(resolver);
    return require('module-to-cdn');
};
