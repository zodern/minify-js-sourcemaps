Package.describe({
  name: 'zodern:minifier-js',
  summary: "JavaScript minifier",
  version: "2.0.0"
});

Npm.depends({
  "uglify-js": "2.8.21"
});

Package.onUse(function (api) {
  api.use('babel-compiler');
  api.export(['meteorJsMinify']);
  api.addFiles(['plugin/minify-js.js'], 'server');
});
