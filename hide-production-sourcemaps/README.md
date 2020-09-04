# zodern:hide-production-sourcemaps

Prevents access to source maps in production and any files in your `public` folder with the `.map` file extension.

Install with
```
meteor add zodern:hide-production-sourcemaps
```

`zodern:hide-production-sourcemaps` only runs in production.

To temporarily disable, set the `EXPOSE_SOURCE_MAPS` environment variable to `true`.

It works by preventing the Webapp package from adding the `x-sourcemap` header to javascript files, and removing the source maps from Webapp's list of static files.
