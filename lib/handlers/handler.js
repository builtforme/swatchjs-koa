const response = require('../response');

async function handler(koaCtx, params, method) {
  try {
    const result = await method.handle(params);
    response.successResponse(koaCtx, result);
  } catch (error) {
    response.errorResponse(koaCtx, error);
  }
}

module.exports = handler;
