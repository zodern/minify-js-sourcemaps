`zodern:standard-minifier-js` is a fork of `standard-minifier-js` that is able to generate production sourcemaps.

First, you need to uninstall `standard-minifier-js`
```
meteor remove standard-minifier-js
```

Then install this fork with:
```
meteor add zodern:standard-minifier-js
```

Starting in version 3, the javascript file is no longer named `app.js`. Instead, Meteor decides the file name, which is consistent with what `standard-minifier-js` does.

The sourcemap is saved in the bundle from `meteor build` or `meteor --production` at `programs/web.browser/<filename>.js.map`. The bundle from `meteor --production` is in `.meteor/local/build`.

If you want to prevent access to the sourcemaps, you can add the `zodern:hide-production-sourcemaps` package.
```
meteor add zodern:hide-production-sourcemaps
```

Known problems:
- Minifying takes a lot longer
