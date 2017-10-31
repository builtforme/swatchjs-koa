const swatchKoaMiddleware = require('swatchjs-koa-middleware');

const response = require('./response');

const methods = swatchKoaMiddleware.methods;

function wrapMiddleware(validateFn, verb) {
  async function validationWrapper(koaCtx, next) {
    try {
      // Get the params from request body and validate
      //  Updates koaCtx.swatchCtx with validated params
      const requestParams = methods[verb](koaCtx);
      validateFn(koaCtx, requestParams);

      await next();
    } catch (error) {
      // Validation error should trigger failure response
      response.errorResponse(koaCtx, error);
    }
  }

  return validationWrapper;
}

module.exports = {
  wrapMiddleware,
};
