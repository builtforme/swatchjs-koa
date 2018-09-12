const middleware = require('swatchjs-koa-middleware');

const constants = require('./constants');

const { response } = middleware;

function responseHandler(fn, options) {
  function setResponse(ctx, result) {
    // Decide whether to set the request id as response header
    const prop = options.requestIdProp;
    if (prop !== undefined) {
      const requestId = ctx[prop];
      if (requestId !== undefined) {
        ctx.set(constants.REQUEST_ID_HEADER_NAME, requestId);
      }
    }

    // Process the request result and set response body
    ctx.body = fn.call(ctx.swatchCtx, result);
  }
  return setResponse;
}

// Helper methods to set a response with no Swatch metadata
//  `ctx` is a Koa context that will handle responding
//  `result` can be any object or primitive type
function rawResponse(options) {
  return responseHandler(response.raw, options);
}

// Helper methods to set a success or error response
//  `ctx` is a Koa context that will handle responding
//  `result` can be any object or primitive type
function successResponse(options) {
  return responseHandler(response.success, options);
}

// Helper methods to set a success or error response
//  `ctx` is a Koa context that will handle responding
//  `errorObj'` can be a string, Error object, or dict
function errorResponse(options) {
  return responseHandler(response.error, options);
}

module.exports = {
  errorResponse,
  rawResponse,
  successResponse,
};
