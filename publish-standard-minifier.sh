rm -r ./standard-minifier-js-sourcemaps/.npm/plugin/fastMinifier/node_modules/meteor-package-install-swc/.swc
rm ./standard-minifier-js-sourcemaps/.npm/plugin/fastMinifier/node_modules/meteor-package-install-swc/.meteor-last-rebuild-version.json

cd standard-minifier-js-sourcemaps
meteor publish
