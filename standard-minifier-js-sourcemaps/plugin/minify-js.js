const { extractModuleSizesTree } = require("./stats.js");
const { CachingMinifier } = require("meteor/zodern:caching-minifier");
const generatePackageMap = require('./generate-package-map.js');
const { CombinedFile } = require('@zodern/source-maps');

const statsEnabled = process.env.DISABLE_CLIENT_STATS !== 'true'

if (typeof Profile === 'undefined') {
  if (Plugin.Profile) {
    Profile = Plugin.Profile;
  } else {
    Profile = function (label, func) {
      return function () {
        return func.apply(this, arguments);
      }
    }
    Profile.time = function (label, func) {
      func();
    }
  }
}

let swc;

Plugin.registerMinifier({
  extensions: ['js'],
  archMatching: 'web'
}, function () {
  var minifier = new MeteorBabelMinifier();
  return minifier;
});

class MeteorBabelMinifier extends CachingMinifier {
  constructor() {
    super({
      minifierName: 'fast-minifier'
    })
  }

  _minifyWithSwc(file) {
    swc = swc || require('meteor-package-install-swc'); 
    const NODE_ENV = process.env.NODE_ENV || 'development';

    let map = file.getSourceMap();
    let content = file.getContentsAsString();

    if (!map) {
      map = generatePackageMap(content, file.getPathInBundle());
    }

    if (map) {
      map = JSON.stringify(map);
    }

    return swc.minifySync(
      content,
      {
        ecma: 5,
        compress: {
          drop_debugger: false,

          unused: false,
          dead_code: true,
          typeofs: false,

          global_defs: {
            'process.env.NODE_ENV': NODE_ENV,
          },
        },
        sourceMap: map ? {
          content: map,
        } : undefined,
        safari10: true,
        inlineSourcesContent: true
      }
    );
  }

  _minifyWithTerser(file) {
    let terser = require('terser');
    const NODE_ENV = process.env.NODE_ENV || 'development';

    return terser.minify(file.getContentsAsString(), {
      compress: {
        drop_debugger: false,
        unused: false,
        dead_code: true,
        global_defs: {
          "process.env.NODE_ENV": NODE_ENV
        }
      },
      // Fix issue meteor/meteor#9866, as explained in this comment:
      // https://github.com/mishoo/UglifyJS2/issues/1753#issuecomment-324814782
      // And fix terser issue #117: https://github.com/terser-js/terser/issues/117
      safari10: true,
      sourceMap: {
        content: file.getSourceMap()
      }
    });
  }

  minifyOneFile(file) {
    try {
      return this._minifyWithSwc(file);
    } catch (swcError) {
      try {
        // swc always parses as if the file is a module, which is
        // too strict for some Meteor packages. Try again with terser
        return this._minifyWithTerser(file).await();
      } catch (_) {
        // swc has a much better error message, so we use it
        throw swcError;
      }
    }
  }
}

MeteorBabelMinifier.prototype.processFilesForBundle = Profile('processFilesForBundle', function (files, options) {
  var mode = options.minifyMode;

  // don't minify anything for development
  if (mode === 'development') {
    files.forEach(function (file) {
      let map = file.getSourceMap();
      if (!map) {
        map = generatePackageMap(file.getContentsAsString(), file.getPathInBundle());
      }

      file.addJavaScript({
        data: file.getContentsAsBuffer(),
        sourceMap: map,
        path: file.getPathInBundle(),
      });
    });
    return;
  }

  const minifiedResults = [];
  const toBeAdded = {
    data: "",
    stats: Object.create(null)
  };

  var combinedFile = new CombinedFile();

  files.forEach(file => {
    // Don't reminify *.min.js.
    // FIXME: this still minifies .min.js app files since they were all combined into app.js
    if (/\.min\.js$/.test(file.getPathInBundle())) {
      minifiedResults.push({
        code: file.getContentsAsString(),
        map: file.getSourceMap()
      });
    } else {
      var minified;
      let label = 'minify file'
      if (file.getPathInBundle() === 'app/app.js') {
        label = 'minify app/app.js'
      }
      if (file.getPathInBundle() === 'packages/modules.js') {
        label = 'minify packages/modules.js'
      }

      try {
        Profile.time(label, () => {
          minified = this.minifyFile(file);
        });

        if (!(minified && typeof minified.code === "string")) {
          throw new Error();
        }

      } catch (err) {
        var filePath = file.getPathInBundle();

        err.message += " while minifying " + filePath;
        throw err;
      }

      if (statsEnabled) {
        let tree;
        Profile.time('extractModuleSizesTree', () => {
          tree = extractModuleSizesTree(minified.code);
        });

        if (tree) {
          toBeAdded.stats[file.getPathInBundle()] =
            [Buffer.byteLength(minified.code), tree];
        } else {
          toBeAdded.stats[file.getPathInBundle()] =
            Buffer.byteLength(minified.code);
        }
      }

      minifiedResults.push({
        file: file.getPathInBundle(),
        code: minified.code,
        map: minified.map
      });
    }

    Plugin.nudge();
  });

  let output;
  Profile.time('concat', () => {
    minifiedResults.forEach(function (result, index) {
      if (index > 0) {
        combinedFile.addGeneratedCode('\n\n');
      }

      let map = result.map;

      if (typeof map === 'string') {
        map = JSON.parse(result.map);
      }

      combinedFile.addCodeWithMap(result.file, { code: result.code, map });

      Plugin.nudge();
    });

    output = combinedFile.build();
  });

  if (files.length) {
    Profile.time('addJavaScript', () => {
      toBeAdded.data = output.code;
      toBeAdded.sourceMap = output.map;
      files[0].addJavaScript(toBeAdded);
    });
  }
});
