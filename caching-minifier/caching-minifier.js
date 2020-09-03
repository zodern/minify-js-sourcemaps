import { Random } from 'meteor/random';
const LRU = Npm.require('lru-cache');

const fs = Plugin.fs;
const path = Plugin.path;

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

const CachingCompilerBase = Object.getPrototypeOf(CachingCompiler);

export class CachingMinifier extends CachingCompilerBase {
  constructor({
    minifierName,
    defaultCacheSize,
  }) {
    super({ compilerName: minifierName, defaultCacheSize });

    // Maps from a hashed cache key to the minify result.
    this._cache = new LRU({
      max: this._cacheSize,
      length: (value) => this.compileResultSize(value),
    });
  }

  // Your subclass should call minifyFile for each file that
  // is in the bundle. It takes care of caching and will
  // call minifyOneFile as needed.
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

  // Your subclass must override this method to handle minifing a single file.
  // Your minifier should not call minifyOneFile directly
  // Instead, it should call minifyFile.
  //
  // Given an InputFile (the data type passed to processFilesForBundle as part
  // of the Plugin.registerMinifier API), compiles the file and returns the
  // result.
  //
  // This method is not called on files when a valid cache entry exists in
  // memory or on disk.
  //
  // This method should not call `inputFile.addJavaScript`!
  // That should be handled in processFilesForBundle
  minifyOneFile () {
    throw new Error('CachingMinifier subclass should implement minifyOneFile!');
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

  // The following methods were copied from CachingMinifier
  // and modified to be compatible with a wider range
  // of Meteor versions

  _cacheFilename(cacheKey) {
    // We want cacheKeys to be hex so that they work on any FS and never end in
    // .cache.
    if (!/^[a-f0-9]+$/.test(cacheKey)) {
      throw Error('bad cacheKey: ' + cacheKey);
    }
    return path.join(this._diskCache, cacheKey + '.cache');
  }

  // Returns null if the file does not exist or can't be parsed; otherwise
  // returns the parsed compileResult in the file.
  _readAndParseCompileResultOrNull(filename) {
    const raw = this._readFileOrNull(filename);
    return this.parseCompileResult(raw);
  }

  // Load a cache entry from disk. Returns the compileResult object
  // and loads it into the in-memory cache too.
  _readCache(cacheKey) {
    if (!this._diskCache) {
      return null;
    }
    const cacheFilename = this._cacheFilename(cacheKey);
    const compileResult = this._readAndParseCompileResultOrNull(cacheFilename);
    if (!compileResult) {
      return null;
    }
    this._cache.set(cacheKey, compileResult);
    return compileResult;
  }

  _writeCacheAsync(cacheKey, compileResult) {
    if (!this._diskCache)
      return;
    const cacheFilename = this._cacheFilename(cacheKey);
    const cacheContents = this.stringifyCompileResult(compileResult);
    this._writeFile(cacheFilename, cacheContents);
  }

  // Write the file atomically.
  _writeFile(filename, contents) {
    const tempFilename = filename + '.tmp.' + Random.id();
    try {
      fs.writeFileSync(tempFilename, contents);
      fs.renameSync(tempFilename, filename);
    } catch (e) {
      this._cacheDebug(e)
      // ignore errors, it's just a cache
    }
  }
}
