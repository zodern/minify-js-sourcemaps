const hideSourceMaps = (staticFiles) => {
  Object.keys(staticFiles).forEach((key) => {
    if (key.endsWith(".map")) {
      delete staticFiles[key];
      return;
    }
    staticFiles[key].sourceMapUrl = false;
  });
}

if (process.env.EXPOSE_SOURCE_MAPS !== 'true') {
  if (WebAppInternals.staticFilesByArch) {
    Object
      .keys(WebAppInternals.staticFilesByArch)
      .forEach((arch) => hideSourceMaps(WebAppInternals.staticFilesByArch[arch]));
  }
  if (WebAppInternals.staticFiles) {
    hideSourceMaps(WebAppInternals.staticFiles);
  }
} else {
  console.warn('Source maps are not hidden since the env var EXPOSE_SOURCE_MAPS is set to "true"');
}

const middleware = (request, response, next) => {
  if (request.method === "POST") {
    const chunks = [];
    request.on("data", chunk => chunks.push(chunk));
    request.on("end", () => {
      try {
        const body = JSON.stringify(JSON.parse(Buffer.concat(chunks).toString()))
        if (body.toLowerCase().includes(".map\""))
          response.destroy();
      } catch (e) {
        response.destroy();
      }
    });
  }
  next();
}

WebAppInternals.meteorInternalHandlers.use(
  "/__meteor__/dynamic-import/fetch",
  middleware
);
