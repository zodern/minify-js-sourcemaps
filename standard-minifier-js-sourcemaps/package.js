Package.describe({
  name: 'zodern:standard-minifier-js',
  version: '5.0.0-beta.4',
  summary: 'Fast javascript minifier that creates production sourcemap',
  documentation: '../readme.md',
  git: 'https://github.com/zodern/minify-js-sourcemaps.git'
});

Package.registerBuildPlugin({
  name: 'fastMinifier',
  use: [
    'modules@0.7.5',
    'zodern:caching-minifier@0.5.0'
  ],
  sources: [
    'plugin/minify-js.js',
    'plugin/stats.js'
  ],
  npmDependencies: {
    'meteor-package-install-swc': '1.0.1',
    'concat-with-sourcemaps': '1.1.0',
    'acorn': '8.10.0',
    '@babel/parser': '7.22.7',
    'terser': '5.19.2',
    '@zodern/source-maps': '1.1.0'
  }
});

Package.onUse(function(api) {
  api.use('isobuild:minifier-plugin@1.0.0');
});
