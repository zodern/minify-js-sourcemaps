# zodern:standard-minifier-js

Fast javascript minifier for Meteor apps that creates source maps

Features:

- Creates production source maps
- Very fast by using disk and memory caches
- Compatible with Meteor 1.4 and newer
- Generates bundle stats for [bundle-visualizer](https://atmospherejs.com/meteor/bundle-visualizer) (requires Meteor 1.6 or newer)

First, you need to remove `standard-minifier-js` from your app

```shell
meteor remove standard-minifier-js
```

Then add this package with:

```shell
meteor add zodern:standard-minifier-js
```

If you want to prevent access to the source maps, you can add the `zodern:hide-production-sourcemaps` package. Source maps include the original content from all of your client fields, so you probably want to hide it.

```shell
meteor add zodern:hide-production-sourcemaps
```

## Error tracking

Source maps allow error tracking services to show you better stack traces. I run [Monti APM](https://montiapm.com) which provides an error tracking service and can use your app's source maps with no additional config.

To use with other error tracking services, you will need to update the source maps when deploying. The source map is saved in the bundle from `meteor build` at `programs/web.browser/<filename>.js.map`.

## Caches

When deploying from CI, you will need to configure the CI to cache at least parts of the `.meteor/local` folder for the minify cache to work. Learn more at [this blog post](https://zodern.me/posts/meteor-local-folder/#caching-in-ci).
