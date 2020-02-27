export class CachingMinifier extends CachingCompiler {
  constructor({
    minifierName,
    defaultCacheSize,
  }) {
    super({ compilerName: minifierName, defaultCacheSize });
  }

  compileResultSize(result) {
    let sourceMapSize = 0;

    if (typeof result.sourcemap === 'string') {
      sourceMapSize = result.sourcemap.length;
    } else {
      sourceMapSize = this.sourceMapSize(result.sourcemap);
    }

    return result.code ? result.code.length + sourceMapSize : 0;
  }

  minifyFile(file) {
    // The hash meteor provides seems to change more than
    // necessary, so we create our own here based on only what 
    // affects the minified output
    const key = this._deepHash({
      content: file.getContentsAsString(),
      sourcemap: JSON.stringify(file.getSourceMap()),
    });
    let result = this._cache.get(key);
    let source = 'memory';

    if (!result) {
      result = this._readCache(key);
      source = 'file';
    }
    if (!result) {
      result = this.minifyOneFile(file);
      this._cache.set(key, result);
      this._writeCacheAsync(key, result);
      source = null;
    }

    if (source) {
      this._cacheDebug(`Loaded minified ${file.getPathInBundle()} from ${source} cache`)
    } else {
      this._cacheDebug(`Cache miss for ${file.getPathInBundle()}`)
    }

    return result;
  }

  minifyOneFile () {
    throw new Error('CachingMinifier subclass should implement minifyOneFile!');
  }
}
