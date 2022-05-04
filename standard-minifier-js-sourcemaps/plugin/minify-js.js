import { extractModuleSizesTree, statsEnabled } from "./stats.js";
import Concat from 'concat-with-sourcemaps';
import { CachingMinifier } from "meteor/zodern:caching-minifier"

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

Plugin.registerMinifier({
    extensions: ['js'],
    archMatching: 'web'
  },
  () => new MeteorMinifier()
);

class MeteorMinifier extends CachingMinifier {
  constructor() {
    super({
      minifierName: 'fast-minifier'
    })
  }
  minifyOneFile(file) {
    return meteorJsMinify(
      file.getContentsAsString(),
      file.getSourceMap(),
      file.getPathInBundle()
    );
  }
}

MeteorMinifier.prototype.processFilesForBundle = Profile('processFilesForBundle', function(files, options) {
  const mode = options.minifyMode;

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

  function maybeThrowMinifyErrorBySourceFile(error, file) {
    const lines = file.getContentsAsString().split(/\n/);
    const lineContent = lines[error.line - 1];

    let originalSourceFileLineNumber = 0;

    // Count backward from the failed line to find the oringal filename
    for (let i = (error.line - 1); i >= 0; i--) {
      let currentLine = lines[i];

      // If the line is a boatload of slashes (8 or more), we're in the right place.
      if (/^\/\/\/{6,}$/.test(currentLine)) {

        // If 4 lines back is the same exact line, we've found the framing.
        if (lines[i - 4] === currentLine) {

          // So in that case, 2 lines back is the file path.
          let originalFilePath = lines[i - 2].substring(3).replace(/\s+\/\//, "");

          throw new Error(
            `terser minification error (${error.name}:${error.message})\n` +
            `Source file: ${originalFilePath}  (${originalSourceFileLineNumber}:${error.col})\n` +
            `Line content: ${lineContent}\n`);
        }
      }
      originalSourceFileLineNumber++;
    }
  }
  


  const toBeAdded = {
    data: "",
    stats: Object.create(null)
  };

  const concat = new Concat(true, '', '\n\n');
  const minifiedResults = [];

  files.forEach(file => {
    // Don't reminify *.min.js.
    // FIXME: this still minifies .min.js app files since they were all combined into app.js
    if (/\.min\.js$/.test(file.getPathInBundle())) {
      minifiedResults.push({
        code: file.getContentsAsString(),
        map: file.getSourceMap()
      });
    } else {
      let minified;
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

        maybeThrowMinifyErrorBySourceFile(err, file);

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
        map: minified.sourcemap
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
