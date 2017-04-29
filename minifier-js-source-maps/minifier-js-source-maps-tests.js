// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by minifier-js-source-maps.js.
import { name as packageName } from "meteor/minifier-js-source-maps";

// Write your tests here!
// Here is an example.
Tinytest.add('minifier-js-source-maps - example', function (test) {
  test.equal(packageName, "minifier-js-source-maps");
});
