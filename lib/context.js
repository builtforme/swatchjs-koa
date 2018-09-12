const constants = require('./constants');

// Given the swatch configuration options, check for an
//  `onException` handler and return a KOA-compliant middleware
//   function that will init the swatch context and then await
function init(options) {
  // Check if user configured a custom 'requestIdProp'. If so, check the
  //  request headers for a client-specified request guid, and if found,
  //  override the KOA bunyan logger request id field with client value
  function overrideClientRequestId(ctx) {
    const prop = options.requestIdProp;
    if (prop !== undefined) {
      const clientRequestId = ctx.request.headers[constants.REQUEST_ID_HEADER_NAME];
      if (clientRequestId !== undefined) {
        ctx[prop] = clientRequestId;
      }
    }
  }

  async function swatchCtxMiddleware(koaCtx, next) {
    // Create the swatchCtx object from the KOA ctx
    koaCtx.swatchCtx = {};

    // Allow access to KOA ctx in case of emergency - Private
    koaCtx.swatchCtx.koaCtx = () => (koaCtx);

    // Copy important properties from the KOA request context
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

    // Set internal properties for Swatch request context
    koaCtx.swatchCtx.request = {
      onException: options.onException,
    };

    // Optionally override the existing bunyan logger request id
    overrideClientRequestId(koaCtx);

    // Continue chain of handlers
    await next();
  }

  return swatchCtxMiddleware;
}


module.exports = {
  init,
};
