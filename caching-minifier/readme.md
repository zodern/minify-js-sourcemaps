# zodern:caching-minifier

An easy way to make minifier plugins cache. Extends [caching-compiler](https://atmospherejs.com/meteor/caching-compiler) to add support for minifiers.

The cache key is a hash of the file's content and source map. Uses both an in-memory and on disk cache.

### Example:

```js
class AwesomeMinifier extends CachingMinifier {
  constructor() {
    super({
      minifierName: 'awesome',
      defaultCacheSize: 1024*1024*10,
    });
  }
  minifyOneFile(inputFile) {
    // Should return a { code, sourcemap } object.
    return Awesomifier.minify(inputFile.getContentsAsString());
  }
  processFilesForBundle(files, options) {
    // normal code for processFilesForBundle
    // except to minify a file call this.minifyFile(file);
    // this.minifyFile handles caching, and will call
    // this.minifyOneFile as needed
  }
}

Plugin.registerMinifier({
  extensions: ['js'],
  archMatching: 'web',
}, () => new AwesomeCompiler());
```
