const response = require('./response');

async function initSwatchCtx(koaCtx, next) {
  // Create the swatchCtx object on the KOA ctx
  koaCtx.swatchCtx = {};

  // Continue chain of handlers
  await next();
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
  initSwatchCtx,
  wrapMiddleware,
};
