var uglify;

meteorJsMinify = function (source, sourcemap, path) {
  var result = {};
  var NODE_ENV = process.env.NODE_ENV || "development";
  var sourcemap = sourcemap || undefined;

  uglify = uglify || Npm.require('uglify-es');

  try {
    var uglifyResult = uglify.minify(source, {
      compress: {
        drop_debugger: false,
        unused: false,
        dead_code: true,
        global_defs: {
          "process.env.NODE_ENV": NODE_ENV
        }
      },
      mangle: {
        // Fix issue meteor/meteor#9866, as explained in this comment:
        // https://github.com/mishoo/UglifyJS2/issues/1753#issuecomment-324814782
        safari10: true
      },
      sourceMap: {
        filename: path || 'app.js',
        content: sourcemap
      }
    });

    if (typeof uglifyResult.code === "string") {
      result.code = uglifyResult.code;
      result.sourcemap = uglifyResult.map;
      result.minifier = 'uglify-es';
    } else {
      throw uglifyResult.error ||
        new Error("unknown uglify.minify failure");
    }
  } catch (e) {
    // Although Babel.minify can handle a wider variety of ECMAScript
    // 2015+ syntax, it is substantially slower than UglifyJS, so we use
    // it only as a fallback.
    var babelResult = Babel.minify(source, {
      sourceMaps: true,
      inputSourceMap: sourcemap,
      sourceFileName: path
    });

    result.code = babelResult.code;
    result.sourcemap = babelResult.map;
    result.minifier = 'babel-minify';
  }

  return result;
};
