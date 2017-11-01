function init(options) {
  async function swatchCtxMiddleware(koaCtx, next) {
    // Create the swatchCtx object on the KOA ctx
    koaCtx.swatchCtx = {};
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
