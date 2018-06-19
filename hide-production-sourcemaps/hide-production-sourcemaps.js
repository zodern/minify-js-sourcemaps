var fileInfo = WebAppInternals.staticFiles;
Object.keys(WebAppInternals.staticFilesByArch).forEach(function(arch) {
  const staticFiles = WebAppInternals.staticFilesByArch[arch];
    Object.keys(staticFiles).forEach(function(key) {
      if (key.endsWith(".map")) {
        delete staticFiles[key];
        return;
      }
      staticFiles[key].sourceMapUrl = false;
  });
});
