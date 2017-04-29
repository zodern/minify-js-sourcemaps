Package.describe({
  name: 'zodern:standard-minifier-js',
  version: '2.0.0',
  summary: 'Standard javascript minifiers used with Meteor apps by default.',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: 'minifyStdJS',
  use: ['sanjo:meteor-files-helpers', 'zodern:minifier-js'],
  sources: ['plugin/minify-js.js'],
  npmDependencies: {
  'concat-with-sourcemaps': '1.0.4'
  }
});


Package.onUse(function(api) {
  api.use('isobuild:minifier-plugin@1.0.0');
});
