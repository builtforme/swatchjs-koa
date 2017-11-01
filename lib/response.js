const middleware = require('swatchjs-koa-middleware');

const response = middleware.response;

// Helper methods to set a response with no Swatch metadata
//  `ctx` is a Koa context that will handle responding
//  `result` can be any object or primitive type
function rawResponse(ctx, result) {
  ctx.body = response.raw.call(ctx.swatchCtx, result);
}

// Helper methods to set a success or error response
//  `ctx` is a Koa context that will handle responding
//  `result` can be any object or primitive type
function successResponse(ctx, result) {
  ctx.body = response.success.call(ctx.swatchCtx, result);
}

// Helper methods to set a success or error response
//  `ctx` is a Koa context that will handle responding
//  `errorObj'` can be a string, Error object, or dict
function errorResponse(ctx, errorObj) {
  ctx.body = response.error.call(ctx.swatchCtx, errorObj);
}

module.exports = {
  errorResponse,
  rawResponse,
  successResponse,
};
