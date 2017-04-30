var fileInfo = WebAppInternals.staticFiles;
Object.keys(WebAppInternals.staticFiles).forEach(function(key) {
  if (key.indexOf(".map") === key.length - ".map".length) {
    delete WebAppInternals.staticFiles[key];
    return;
  }
  WebAppInternals.staticFiles[key].sourceMapUrl = false;
});
