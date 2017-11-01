const response = require('./response');

// Generic function to wrap any `fn` as KOA middleware
//  `fn` signature accepts KOA ctx + next callback
//  Catches any errors and returns an error response
function wrap(fn) {
  async function middlewareWrapper(koaCtx, next) {
    try {
      await fn(koaCtx, next);
    } catch (error) {
      // Auth error should trigger failure response
      response.errorResponse(koaCtx, error);
    }
  }

  return middlewareWrapper;
}


module.exports = {
  wrap,
};