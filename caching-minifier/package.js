Package.describe({
  name: 'zodern:caching-minifier',
  version: '0.3.1',
  summary: 'An easy way to make minifier plugins cache',
  documentation: './readme.md',
  git: 'https://github.com/zodern/minify-js-sourcemaps.git'
});

Npm.depends({
  'lru-cache': '5.1.1'
})

Package.onUse(function(api) {
  api.use('isobuild:minifier-plugin@1.0.0');
  api.use('ecmascript@0.7.0')
  api.use('caching-compiler@1.2.1')
  api.use('random@1.0.9')
  api.mainModule('caching-minifier.js', 'server');
  api.export('CachingMinifier', 'server');
});
