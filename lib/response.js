// Helper methods to set a success or error response
//  `ctx` is a Koa context that will handle responding
//  `result` can be any object or primitive typeof
//  `error'` can either be a string or an Error object
function successResponse(ctx, result) {
  ctx.body = {
    ok: true,
    result,
  };
}

function errorResponse(ctx, error) {
  ctx.body = {
    ok: false,
    error: (error && error.message) || error,
  };
}

module.exports = {
  successResponse,
  errorResponse,
};
