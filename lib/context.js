// Given the swatch configuration options, check for an
//  `onException` handler and return a KOA-compliant middleware
//   function that will init the swatch context and then await
function init(options) {
  async function swatchCtxMiddleware(koaCtx, next) {
    // Create the swatchCtx object from the KOA ctx
    koaCtx.swatchCtx = {};

    // Allow access to KOA ctx in case of emergency - Private
    koaCtx.swatchCtx.koaCtx = () => (koaCtx);

    koaCtx.swatchCtx.req = {
      headers: Object.assign({}, koaCtx.request.headers),
      href: koaCtx.request.href,
      host: koaCtx.request.host,
      method: koaCtx.request.method,
      origin: koaCtx.request.origin,
      path: koaCtx.request.path,
      protocol: koaCtx.request.protocol,
      query: koaCtx.request.query,
      secure: koaCtx.request.secure,
      url: koaCtx.request.url,
    };
    koaCtx.swatchCtx.request = {
      onException: options.onException,
    };

    // Continue chain of handlers
    await next();
  }

  return swatchCtxMiddleware;
}


module.exports = {
  init,
};
