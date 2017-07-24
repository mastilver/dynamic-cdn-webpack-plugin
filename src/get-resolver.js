export default function getResolver(resolver = 'module-to-cdn') {
    if (typeof resolver === 'function') {
        return resolver;
    }

    return require(resolver);
}
