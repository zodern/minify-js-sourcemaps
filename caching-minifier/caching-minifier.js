import { Random } from 'meteor/random';
const fs = Plugin.fs;

if (typeof Profile === 'undefined') {
  var Profile = function (label, func) {
    return function () {
      return func.apply(this, arguments);
    }
  }
  Profile.time = function (label, func) {
    func();
  }
}

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
    let key
    Profile.time('hash', () => {
      key = this._deepHash({
        content: file.getContentsAsString(),
        sourcemap: JSON.stringify(file.getSourceMap()),
      });
    })
    let result = this._cache.get(key);
    let source = 'memory';

    if (!result) {
      Profile.time('readCache', () => {
        result = this._readCache(key);
        source = 'file';
      })
    }
    if (!result) {
      Profile.time('minifyOneFile', () => {
        result = this.minifyOneFile(file);
      });
      this._cache.set(key, result);
      this._writeCacheAsync(key, result);
      source = null;
    }

    if (source) {
      this._cacheDebug(`Loaded minified ${file.getPathInBundle()} from ${source} cache`)
    } else {
      this._cacheDebug(`Cache miss for ${file.getPathInBundle()} with the key "${key}"`)
    }

    return result;
  }

  minifyOneFile () {
    throw new Error('CachingMinifier subclass should implement minifyOneFile!');
  }

  // Overrides method to log errors and
  // to use the sync fs calls since Meteor 1.8.2
  // changed the async versions to be aliases to the sync version. 
  //
  // We want to write the file atomically. But we also don't want to block
  // processing on the file write.
  _writeFileAsync(filename, contents) {
    const tempFilename = filename + '.tmp.' + Random.id();
    // Write cache file synchronously when cache debugging enabled.
    try {
      fs.writeFileSync(tempFilename, contents);
      fs.renameSync(tempFilename, filename);
    } catch (e) {
      this._cacheDebug(e)
      // ignore errors, it's just a cache
    }
  }
}
