// Given the swatch configuration options, check for an
//  `onException` handler and return a KOA-compliant middleware
//   function that will init the swatch context and then await
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
