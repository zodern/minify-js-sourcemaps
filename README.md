`zodern:standard-minifier-js` is a fork of `standard-minifier-js`, with two changes:
1) The minified js file always has the same name: `app.js`
2) It creates a sourcemap for it

First, you need to uninstall `standard-minifier-js`
```
meteor remove standard-minifier-js
```

Then install this fork with:
```
meteor add zodern:standard-minifier-js
```

The sourcemap is saved in the bundle from `meteor build` or `meteor --production` at `programs/web.browser/app.js.map`. The bundle from `meteor --production` is in `.meteor/local/build`.

With this package, the main javascript file is always named `app.js`.

If you want to prevent access to the sourcemaps, you can add the `zodern:hide-production-sourcemaps` package.
```
meteor add zodern:hide-production-sourcemaps
```

Known problems:
- Babili (used when uglify failes) is not setup to create sourcemaps yet
- Minifying takes a lot longer
