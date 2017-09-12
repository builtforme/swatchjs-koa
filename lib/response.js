// Helper functions to actually set the full response
function setSuccessResponse(ctx, result) {
  ctx.body = {
    ok: true,
    result,
  };
}

function setErrorResponse(ctx, error, details) {
  ctx.body = {
    ok: false,
    error,
    details,
  };
}

function getErrorMessage(errorObj) {
  return (errorObj && errorObj.message) || errorObj;
}

function getErrorDetails(errorObj) {
  return (errorObj && errorObj.details) || undefined;
}

// Helper methods to set a response with no Swatch metadata
//  `ctx` is a Koa context that will handle responding
//  `result` can be any object or primitive type
function rawResponse(ctx, result) {
  ctx.body = result;
}

// Helper methods to set a success or error response
//  `ctx` is a Koa context that will handle responding
//  `result` can be any object or primitive type
function successResponse(ctx, result) {
  setSuccessResponse(ctx, result);
}

// Helper methods to set a success or error response
//  `ctx` is a Koa context that will handle responding
//  `errorObj'` can be a string, Error object, or dict
function errorResponse(ctx, errorObj) {
  try {
    // Allow client to rescue the exception and return a value
    //  which we send back to the client as a success response
    const result = ctx.swatchCtx.request.onException(errorObj);

    setSuccessResponse(ctx, result);
  } catch (exceptionObj) {
    // Otherwise the client can either rethrow the error or
    //  throw a different error which we return as failure
    const error = getErrorMessage(exceptionObj);
    const details = getErrorDetails(exceptionObj);

    // Check for the internal error code/string from the `errorObj`
    setErrorResponse(ctx, error, details);
  }
}

module.exports = {
  successResponse,
  errorResponse,
  rawResponse,
};
