Package.describe({
  name: 'zodern:standard-minifier-js',
  version: '4.0.0-beta.5',
  summary: 'Fast javascript minifier that creates production sourcemap',
  documentation: '../readme.md',
  git: 'https://github.com/zodern/minify-js-sourcemaps.git'
});

Package.registerBuildPlugin({
  name: 'fastMinifier',
  use: [
    'zodern:minifier-js@3.0.0',
    'babel-compiler@6.18.2 || 7.0.0',
    'ecmascript@0.7.0',
    'zodern:caching-minifier@0.3.1'
  ],
  sources: [
    'plugin/minify-js.js',
    'plugin/stats.js',
    'plugin/utils.js',
  ],
  npmDependencies: {
    'concat-with-sourcemaps': '1.1.0',
  }
});

Package.onUse(function(api) {
  api.use('isobuild:minifier-plugin@1.0.0');
});
