export default function getResolver(resolver = '@talend/module-to-cdn') {
    if (typeof resolver === 'function') {
        return resolver;
    }

    return require(resolver);
}
