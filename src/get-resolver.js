export default function getResolver(resolver) {
    if (typeof resolver === 'function') return resolver;
    else if (typeof resolver === 'string') return require(resolver);
    return require('module-to-cdn');
}
