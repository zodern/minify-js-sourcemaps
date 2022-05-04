Package.describe({
  name: 'zodern:minifier-js',
  summary: "JavaScript minifier",
  version: "5.0.0",
  documentation: null,
  git: "https://github.com/zodern/minify-js-sourcemaps.git"
});

Npm.depends({
  "terser": "5.12.1"
});

Package.onUse(function (api) {
  api.use('ecmascript');
  api.use('babel-compiler');
  api.export(['meteorJsMinify']);
  api.mainModule('minifier.js', 'server');
});
