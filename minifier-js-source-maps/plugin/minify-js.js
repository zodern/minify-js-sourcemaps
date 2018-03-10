var uglify;

meteorJsMinify = function (source, sourcemap = {}, path) {
  var result = {};
  uglify = uglify || Npm.require('uglify-es');
  var NODE_ENV = process.env.NODE_ENV || "development";

  try {
    var minified = uglify.minify(source, {
      compress: {
        drop_debugger: false,
        unused: false,
        dead_code: true,
        global_defs: {
          "process.env.NODE_ENV": NODE_ENV
        }
      },
      sourceMap: {
        filename: path || 'app.js',
        content: sourcemap
      }
    });
    result.code = minified.code;
    result.sourcemap = minified.map;
  } catch (e) {
    // TODO: create sourcemaps when using babili

    // Although Babel.minify can handle a wider variety of ECMAScript
    // 2015+ syntax, it is substantially slower than UglifyJS, so we use
    // it only as a fallback.
    result.code = Babel.minify(source).code;
  }

  return result;
};
