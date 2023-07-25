// Some packages don't have source maps in Meteor 1 and 2.
// Here we try to generate an empty source map for the file

const SourceMap = require('@zodern/source-maps');

const headerRegex = /\(function\(\){\n\n\/*$\s\/\/\s*\/\/\s\/\/\s(packages\/.*)$\s\/\/\s*\/\/\s\/\/*\s\s*\/\/\n/gm;
const pathRegex = /\/\/\s(packages\/.*)\/\//g;
const footerRegex = /^\s\/{14,}\s\s}\).call\(this\);\s\s/gm;

// TODO: use start index
function countLinesTo(content, index) {
  let count = 0;
  let lastIndex = content.indexOf('\n');
  while (lastIndex > -1 && lastIndex < index) {
    count += 1;
    lastIndex = content.indexOf('\n', lastIndex + 1);
  }

  return count;
}

function generateMap (content) {
  let map = new SourceMap();

  let header;
  while ((header = headerRegex.exec(content)) !== null) {
    let start = header.index;
    let bannerEnd = headerRegex.lastIndex;

    pathRegex.lastIndex = start - 1;
    let filePath = pathRegex.exec(content)[1].trim();

    footerRegex.lastIndex = bannerEnd;
    let end = footerRegex.exec(content).index;

    map.addEmptyMap(filePath, content.substring(bannerEnd, end), countLinesTo(content, bannerEnd));

    headerRegex.lastIndex = footerRegex.lastIndex;
  }

  return map.build();
}

module.exports = function (content, path) {
  try {
    return generateMap(content);
  } catch (error) {
    console.log('');
    console.error(`Unable to generate source map for ${path}:`);
    console.error(error);
  }
}
