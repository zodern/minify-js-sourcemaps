Install with:
```
meteor add zodern:standard-minifier-js
```

Creates a production sourcemap while minifing. It is saved in `.production.min.js.map` in your app's root folder.

If you set the environment variable `INLINE_SOURCE_MAPS=true`, it will also add inlin sourcemaps when running in production mode. Do not use inline sourcemaps in production as it greatly increases the size of the javascript file.
