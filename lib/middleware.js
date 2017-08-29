const response = require('./response');

function swatchCtx(options) {
  async function swatchCtxMiddleware(koaCtx, next) {
    // Create the swatchCtx object on the KOA ctx
    koaCtx.swatchCtx = {};
    koaCtx.swatchCtx.request = {
      onExceptionMap: options.onExceptionMap,
    };

    // Continue chain of handlers
    await next();
  }

  return swatchCtxMiddleware;
}

function wrapMiddleware(fn) {
  async function middlewareWrapper(koaCtx, next) {
    try {
      await fn(koaCtx, next);
    } catch (error) {
      // Auth error should trigger failure response
      response.errorResponse(koaCtx, error);
    }
  }

  return middlewareWrapper;
}


module.exports = {
  swatchCtx,
  wrapMiddleware,
};
