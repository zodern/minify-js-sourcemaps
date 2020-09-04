Package.describe({
  name: 'zodern:minifier-js',
  summary: "JavaScript minifier",
  version: "4.0.0",
  documentation: null,
  git: "https://github.com/zodern/minify-js-sourcemaps.git"
});

Npm.depends({
  "terser": "4.4.0"
});

Package.onUse(function (api) {
  api.use('babel-compiler@6.18.2 || 7.0.0');
  api.export(['meteorJsMinify']);
  api.addFiles(['plugin/minify-js.js'], 'server');
});
