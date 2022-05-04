let terser;

const terserMinify = async (path, source, options, callback) => {
  terser = terser || Npm.require("terser");
  try {
    const result = await terser.minify({ [path]: source }, options);
    callback(null, result);
    return result;
  } catch (e) {
    callback(e);
    return e;
  }
};

export const meteorJsMinify = function (source, sourcemap, path) {
  const result = {};
  const NODE_ENV = process.env.NODE_ENV || "development";

  const options = {
    compress: {
      drop_debugger: false,  // remove debugger; statements
      unused: false,         // drop unreferenced functions and variables
      dead_code: true,       // remove unreachable code
      typeofs: false,        // set to false due to known issues in IE10
      global_defs: {
        "process.env.NODE_ENV": NODE_ENV
      }
    },
    // Fix issue #9866, as explained in this comment:
    // https://github.com/mishoo/UglifyJS2/issues/1753#issuecomment-324814782
    // And fix terser issue #117: https://github.com/terser-js/terser/issues/117
    safari10: true,          // set this option to true to work around the Safari 10/11 await bug
    sourceMap: {
      content: sourcemap || undefined
    }
  };

  const terserJsMinify = Meteor.wrapAsync(terserMinify);
  let terserResult;
  try {
    terserResult = terserJsMinify(path, source, options);
  } catch (e) {
    throw e;
  }

  result.code = terserResult.code;
  result.sourcemap = terserResult.map;
  result.minifier = 'terser';

  return result;
};
