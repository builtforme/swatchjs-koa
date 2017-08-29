function runOnExceptionMap(ctx, errorObj) {
  // Check for the internal error code/string from the `errorObj`
  //  and run any client-provided exception handler before returning
  const error = (errorObj && errorObj.message) || errorObj;

  try {
    return ctx.swatchCtx.request.onExceptionMap(error);
  } catch (exceptionError) {
    // Return any exception thrown from inside the map function
    return exceptionError;
  }
}


// Helper methods to set a success or error response
//  `ctx` is a Koa context that will handle responding
//  `result` can be any object or primitive typeof
//  `rawError'` can either be a string or an Error object
function successResponse(ctx, result) {
  ctx.body = {
    ok: true,
    result,
  };
}

function errorResponse(ctx, errorObj) {
  // Check whether `errorObj` includes any client-provided details
  const details = (errorObj && errorObj.details) || undefined;

  // Check for the internal error code/string from the `errorObj`
  //  and run any client-provided exception handler before returning
  const error = runOnExceptionMap(ctx, errorObj);

  ctx.body = {
    ok: false,
    error,
    details,
  };
}

module.exports = {
  successResponse,
  errorResponse,
};
