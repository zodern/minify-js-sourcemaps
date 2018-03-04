var uglify;

meteorJsMinify = function(source, sourcemap = {}, path) {
  var result = {};
  uglify = uglify || Npm.require('uglify-js');
  var NODE_ENV = process.env.NODE_ENV || "development";

  try {
  var minified = uglify.minify(source, {
      fromString: true,
      compress: {
        drop_debugger: false,
        unused: false,
        dead_code: true,
        global_defs: {
          "process.env.NODE_ENV": NODE_ENV
        }
      },
      outFileName: path || 'app.js',
      outSourceMap: "production.min.map",
      sourceMapUrl: false,
      // Some sourcemaps are objects, and some are strings
      inSourceMap: typeof sourcemap === 'object' ? sourcemap : JSON.parse(sourcemap)
    });
    result.code = minified.code;
    result.sourcemap = minified.map;
  } catch (e) {
    console.log(e);
    // TODO: create sourcemaps when using babili

    // Although Babel.minify can handle a wider variety of ECMAScript
    // 2015+ syntax, it is substantially slower than UglifyJS, so we use
    // it only as a fallback.
    result.code = Babel.minify(source).code;
  }

  return result;
};
