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

  minifyFile (file) {
    const key = this._deepHash(file.getSourceHash());
    let result = this._cache.get(key);
  
    if (!result) {
      result = this._readCache(key);
    }
    if (!result) {
      result = this.minifyOneFile(file);
      this._cache.set(key, result);
      this._writeCacheAsync(key, result);
    }
  
    return result;
  }

  minifyOneFile () {
    throw new Error('CachingMinifier subclass should implement minifyOneFile!');
  }
}
