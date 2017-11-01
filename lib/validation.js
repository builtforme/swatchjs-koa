// Each swatch method has an expected `validate` method,
//  which needs to be wrapped into KOA-compliant middleware
// Given that `validateFn`, plus a `paramFn` that maps from
//  the KOA context to the request params, return middleware
function middleware(validateFn, paramFn) {
  async function validationMiddleware(koaCtx, next) {
    // Get the params from request body and validate
    //  Updates koaCtx.swatchCtx with validated params
    const requestParams = paramFn(koaCtx);
    validateFn(koaCtx, requestParams);

    await next();
  }

  return validationMiddleware;
}

module.exports = {
  middleware,
};
