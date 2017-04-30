Hides sourcemaps in production. It does this by preventing the Webapp package from adding the `x-sourcemap` header to javascript files. `zodern:hide-production-sourcemaps` only runs in production.

Please Note: the sourcemaps are still accessible by their url.

Install with
```
meteor add zodern:hide-production-sourcemaps
```
