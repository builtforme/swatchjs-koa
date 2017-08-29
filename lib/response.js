// Helper methods to set a success or error response
//  `ctx` is a Koa context that will handle responding
//  `result` can be any object or primitive typeof
//  `errorObj'` can either be a string or Error object
function successResponse(ctx, result) {
  ctx.body = {
    ok: true,
    result,
  };
}

function getErrorCode(errorObj) {
  return (errorObj && errorObj.message) || errorObj;
}

function errorResponse(ctx, errorObj) {
  // Check whether `errorObj` includes any client-provided details
  const details = (errorObj && errorObj.details) || undefined;

  // Check for the internal error code/string from the `errorObj`
  const errorCode = getErrorCode(errorObj);

  // Run client-provided exception handler which can choose
  //  to throw an alternate error object based on the type
  let error = errorCode;
  try {
    ctx.swatchCtx.request.onException(errorCode);
  } catch (exceptionObj) {
    error = getErrorCode(exceptionObj);
  }

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
