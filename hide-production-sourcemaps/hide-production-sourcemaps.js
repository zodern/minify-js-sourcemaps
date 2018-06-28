const hideSourceMaps = (staticFiles) => {
  Object.keys(staticFiles).forEach((key) => {
    if (key.endsWith(".map")) {
      delete staticFiles[key];
      return;
    }
    staticFiles[key].sourceMapUrl = false;
  });
}

if (WebAppInternals.staticFilesByArch) {
  Object
    .keys(WebAppInternals.staticFilesByArch)
    .forEach((arch) => hideSourceMaps(WebAppInternals.staticFilesByArch[arch]));
}
if (WebAppInternals.staticFiles) {
  hideSourceMaps(WebAppInternals.staticFiles);
}
