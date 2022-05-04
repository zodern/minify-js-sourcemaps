Package.describe({
  name: 'zodern:standard-minifier-js',
  version: '5.0.0',
  summary: 'Fast javascript minifier that creates production sourcemap',
  documentation: '../readme.md',
  git: 'https://github.com/zodern/minify-js-sourcemaps.git'
});

Package.registerBuildPlugin({
  name: 'fastMinifier',
  use: [
    'zodern:minifier-js@5.0.0',
    'babel-compiler',
    'ecmascript',
    'zodern:caching-minifier@0.4.0'
  ],
  sources: [
    'plugin/minify-js.js',
    'plugin/stats.js'
  ],
  npmDependencies: {
    'concat-with-sourcemaps': '1.1.0',
  }
});

Package.onUse(function(api) {
  api.use('isobuild:minifier-plugin@1.0.0');
});
