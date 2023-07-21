// Copied from https://raw.githubusercontent.com/meteor/meteor/devel/packages/caching-compiler/caching-compiler.js
// Using a copy allows us to remove the `ecmascript` dependency
const fs = Plugin.fs;
const path = Plugin.path;
const createHash = Npm.require('crypto').createHash;
const assert = Npm.require('assert');
const LRU = Npm.require('lru-cache');

// Base class for CachingCompiler and MultiFileCachingCompiler.
module.exports = class CachingCompilerBase {
  constructor({
    compilerName,
    defaultCacheSize,
    maxParallelism = 20,
  }) {
    this._compilerName = compilerName;
    this._maxParallelism = maxParallelism;
    const compilerNameForEnvar = compilerName.toUpperCase()
      .replace('/-/g', '_').replace(/[^A-Z0-9_]/g, '');
    const envVarPrefix = 'METEOR_' + compilerNameForEnvar + '_CACHE_';

    const debugEnvVar = envVarPrefix + 'DEBUG';
    this._cacheDebugEnabled = !!process.env[debugEnvVar];

    const cacheSizeEnvVar = envVarPrefix + 'SIZE';
    this._cacheSize = +process.env[cacheSizeEnvVar] || defaultCacheSize;

    this._diskCache = null;

    // For testing.
    this._callCount = 0;

    // Callbacks that will be called after the linker is done processing
    // files, after all lazy compilation has finished.
    this._afterLinkCallbacks = [];
  }

  // Your subclass must override this method to define the key used to identify
  // a particular version of an InputFile.
  //
  // Given an InputFile (the data type passed to processFilesForTarget as part
  // of the Plugin.registerCompiler API), returns a cache key that represents
  // it. This cache key can be any JSON value (it will be converted internally
  // into a hash).  This should reflect any aspect of the InputFile that affects
  // the output of `compileOneFile`. Typically you'll want to include
  // `inputFile.getDeclaredExports()`, and perhaps
  // `inputFile.getPathInPackage()` or `inputFile.getDeclaredExports` if
  // `compileOneFile` pays attention to them.
  //
  // Note that for MultiFileCachingCompiler, your cache key doesn't need to
  // include the file's path, because that is automatically taken into account
  // by the implementation. CachingCompiler subclasses can choose whether or not
  // to include the file's path in the cache key.
  getCacheKey(inputFile) {
    throw Error('CachingCompiler subclass should implement getCacheKey!');
  }

  // Your subclass must override this method to define how a CompileResult
  // translates into adding assets to the bundle.
  //
  // This method is given an InputFile (the data type passed to
  // processFilesForTarget as part of the Plugin.registerCompiler API) and a
  // CompileResult (either returned directly from compileOneFile or read from
  // the cache).  It should call methods like `inputFile.addJavaScript`
  // and `inputFile.error`.
  addCompileResult(inputFile, compileResult) {
    throw Error('CachingCompiler subclass should implement addCompileResult!');
  }

  // Your subclass must override this method to define the size of a
  // CompilerResult (used by the in-memory cache to limit the total amount of
  // data cached).
  compileResultSize(compileResult) {
    throw Error('CachingCompiler subclass should implement compileResultSize!');
  }

  // Your subclass may override this method to define an alternate way of
  // stringifying CompilerResults.  Takes a CompileResult and returns a string.
  stringifyCompileResult(compileResult) {
    return JSON.stringify(compileResult);
  }
  // Your subclass may override this method to define an alternate way of
  // parsing CompilerResults from string.  Takes a string and returns a
  // CompileResult.  If the string doesn't represent a valid CompileResult, you
  // may want to return null instead of throwing, which will make
  // CachingCompiler ignore the cache.
  parseCompileResult(stringifiedCompileResult) {
    return this._parseJSONOrNull(stringifiedCompileResult);
  }
  _parseJSONOrNull(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      if (e instanceof SyntaxError)
        return null;
      throw e;
    }
  }

  _cacheDebug(message) {
    if (!this._cacheDebugEnabled)
      return;
    console.log(`CACHE(${this._compilerName}): ${message}`);
  }

  setDiskCacheDirectory(diskCache) {
    if (this._diskCache)
      throw Error('setDiskCacheDirectory called twice?');
    this._diskCache = diskCache;
  }

  // Since so many compilers will need to calculate the size of a SourceMap in
  // their compileResultSize, this method is provided.
  sourceMapSize(sm) {
    if (!sm) return 0;
    // sum the length of sources and the mappings, the size of
    // metadata is ignored, but it is not a big deal
    return sm.mappings.length
      + (sm.sourcesContent || []).reduce(function (soFar, current) {
        return soFar + (current ? current.length : 0);
      }, 0);
  }

  // Called by the compiler plugins system after all linking and lazy
  // compilation has finished.
  afterLink() {
    this._afterLinkCallbacks.splice(0).forEach(callback => {
      callback();
    });
  }

  // Borrowed from another MIT-licensed project that benjamn wrote:
  // https://github.com/reactjs/commoner/blob/235d54a12c/lib/util.js#L136-L168
  _deepHash(val) {
    const hash = createHash('sha1');
    let type = typeof val;

    if (val === null) {
      type = 'null';
    }
    hash.update(type + '\0');

    switch (type) {
      case 'object':
        const keys = Object.keys(val);

        // Array keys will already be sorted.
        if (!Array.isArray(val)) {
          keys.sort();
        }

        keys.forEach((key) => {
          if (typeof val[key] === 'function') {
            // Silently ignore nested methods, but nevertheless complain below
            // if the root value is a function.
            return;
          }

          hash.update(key + '\0').update(this._deepHash(val[key]));
        });

        break;

      case 'function':
        assert.ok(false, 'cannot hash function objects');
        break;

      default:
        hash.update('' + val);
        break;
    }

    return hash.digest('hex');
  }

  // Write the file atomically.
  _writeFile(filename, contents) {
    const tempFilename = filename + '.tmp.' + Random.id();

    try {
      fs.writeFileSync(tempFilename, contents);
      fs.renameSync(tempFilename, filename);
    } catch (e) {
      // ignore errors, it's just a cache
      this._cacheDebug(e);
    }
  }

  // Helper function. Returns the body of the file as a string, or null if it
  // doesn't exist.
  _readFileOrNull(filename) {
    try {
      return fs.readFileSync(filename, 'utf8');
    } catch (e) {
      if (e && e.code === 'ENOENT')
        return null;
      throw e;
    }
  }
}
