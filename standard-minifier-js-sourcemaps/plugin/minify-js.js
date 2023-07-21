import { extractModuleSizesTree, statsEnabled } from "./stats.js";
var Concat = Npm.require('concat-with-sourcemaps');
import { CachingMinifier } from "meteor/zodern:caching-minifier"
let swc = require('meteor-package-install-swc');

if (typeof Profile === 'undefined') {
  console.log('no profile', Plugin.Profile);
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
  minifyOneFile(file) {
    const NODE_ENV = process.env.NODE_ENV || 'development';
    let map = file.getSourceMap();

    if (map) {
      map = JSON.stringify(map);
    }


    let result = swc.minifySync(
      file.getContentsAsString(),
      {
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

    return result;
  }
}

MeteorBabelMinifier.prototype.processFilesForBundle = Profile('processFilesForBundle', function (files, options) {
  var mode = options.minifyMode;

  // don't minify anything for development
  if (mode === 'development') {
    files.forEach(function (file) {
      file.addJavaScript({
        data: file.getContentsAsBuffer(),
        sourceMap: file.getSourceMap(),
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

  var concat = new Concat(true, '', '\n\n');

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

        // TODO: improve error handling

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

  Profile.time('concat', () => {
    minifiedResults.forEach(function (result) {
      concat.add(result.file, result.code, result.map);
      Plugin.nudge();
    });
  })

  if (files.length) {
    Profile.time('addJavaScript', () => {
      toBeAdded.data = concat.content.toString();
      toBeAdded.sourceMap = concat.sourceMap;
      files[0].addJavaScript(toBeAdded);
    })
  }
});
