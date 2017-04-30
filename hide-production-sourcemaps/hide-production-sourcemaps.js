var fileInfo = WebAppInternals.staticFiles;
Object.keys(WebAppInternals.staticFiles).forEach(function (key) {
  WebAppInternals.staticFiles[key].sourceMapUrl = false;
});
