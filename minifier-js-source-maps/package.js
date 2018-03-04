Package.describe({
  name: 'zodern:minifier-js',
  summary: "JavaScript minifier",
  version: "2.1.0",
  documentation: null,
  git: "https://github.com/zodern/minify-js-sourcemaps.git"
});

Npm.depends({
  "uglify-js": "2.8.21"
});

Package.onUse(function (api) {
  api.use('babel-compiler@6.18.2');
  api.export(['meteorJsMinify']);
  api.addFiles(['plugin/minify-js.js'], 'server');
});
