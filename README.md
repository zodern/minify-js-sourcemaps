# zodern:standard-minifier-js

Fast javascript minifier for Meteor apps that creates source maps

Features:

- Creates production source maps
- Very fast by using disk and memory caches
- Compatible with Meteor 2.5.2 and newer. 
  - For Meteor 1.6 - 2.4, use `zodern:standard-minifier-js@4.1.1`
  - For Meteor 1.4 - 1.5, use `zodern:standard-minifier-js@3.0.0`
- Generates bundle stats for [bundle-visualizer](https://atmospherejs.com/meteor/bundle-visualizer)

First, you need to remove `standard-minifier-js` from your app

```shell
meteor remove standard-minifier-js
```

Then add this package with:

```shell
meteor add zodern:standard-minifier-js
```

If you want to prevent access to the source maps, you can add the `zodern:hide-production-sourcemaps` package. Source maps include the original content from all of your client files, so you probably want to do this step.

```shell
meteor add zodern:hide-production-sourcemaps
```

## Error tracking

Source maps allow error tracking services to show you better stack traces. I run [Monti APM](https://montiapm.com) which provides an error tracking service and can use your app's source maps with no additional config.

To use with other error tracking services, you will need to upload the source maps when deploying. The source map is saved in the bundle from `meteor build` at `programs/<arch>/<filename>.js.map`. You will want to upload the source maps for each web arch, and for the dynamic imports for each arch.

## Caches

When deploying from CI, you will need to configure the CI to cache at least parts of the `.meteor/local` folder for the minify cache to work. Learn more at [this blog post](https://zodern.me/posts/meteor-local-folder/#caching-in-ci).

## Environment Variables

`DISABLE_CLIENT_STATS` Set to `true` to disable creating the `stats.json` file used by the bundle-visualizer. This can save up to 20+ seconds during production builds for large apps.

`METEOR_FASTMINIFIER_CACHE_DEBUG` Set to `true` to view the cache logs
