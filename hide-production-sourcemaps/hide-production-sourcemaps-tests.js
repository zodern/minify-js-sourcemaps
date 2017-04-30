// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by hide-production-sourcemaps.js.
import { name as packageName } from "meteor/zodern:hide-production-sourcemaps";

// Write your tests here!
// Here is an example.
Tinytest.add('hide-production-sourcemaps - example', function (test) {
  test.equal(packageName, "hide-production-sourcemaps");
});
