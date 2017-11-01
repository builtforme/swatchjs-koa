import util from 'util';

// Helper functions to create the full response object
function buildSuccessResponse(result) {
  return {
    ok: true,
    result,
  };
}

function getErrorMessage(errorObj) {
  return (errorObj && errorObj.message) || errorObj;
}

function getErrorDetails(errorObj) {
  return (errorObj && errorObj.details) || undefined;
}

function buildErrorResponse(exceptionObj) {
  const error = getErrorMessage(exceptionObj);
  const details = getErrorDetails(exceptionObj);

  return {
    ok: false,
    error,
    details,
  };
}

function rescueErrorResponse(errorObj) {
  try {
    this.logger.error(
      `Exception thrown by Swatch handler: ${util.inspect(errorObj)}`,
    );

    // Allow client to rescue the exception and return a value
    //  which we send back to the client as a success response
    const result = this.request.onException(errorObj);

    this.logger.warn(
      `Exception was rescued... Success response: ${util.inspect(result)}`,
    );

    return buildSuccessResponse(result);
  } catch (exceptionObj) {
    this.logger.error(
      `Exception was re-thrown...: ${util.inspect(exceptionObj)}`,
    );

    // Check for the internal error code/string from the `errorObj`
    return buildErrorResponse(exceptionObj);
  }
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
  ctx.body = buildSuccessResponse(result);
}

// Helper methods to set a success or error response
//  `ctx` is a Koa context that will handle responding
//  `errorObj'` can be a string, Error object, or dict
function errorResponse(ctx, errorObj) {
  ctx.body = rescueErrorResponse.call(ctx.swatchCtx, errorObj);
}

module.exports = {
  successResponse,
  errorResponse,
  rawResponse,
};
