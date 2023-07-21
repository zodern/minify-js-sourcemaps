Package.describe({
  name: 'zodern:caching-minifier',
  version: '0.4.0',
  summary: 'An easy way to make minifier plugins cache',
  documentation: './readme.md',
  git: 'https://github.com/zodern/minify-js-sourcemaps.git'
});

Npm.depends({
  'lru-cache': '5.1.1'
});

Package.onUse(function(api) {
  api.use('isobuild:minifier-plugin@1.0.0');
  api.use('modules@0.7.5');
  api.mainModule('caching-minifier.js', 'server');
  api.export('CachingMinifier', 'server');
});
