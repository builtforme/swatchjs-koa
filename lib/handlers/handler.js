const response = require('../response');

function handler(requestHandler) {
  async function handleRequest(koaCtx) {
    try {
      const result = await requestHandler(koaCtx);
      response.successResponse(koaCtx, result);
    } catch (error) {
      response.errorResponse(koaCtx, error);
    }
  }

  return handleRequest;
}

module.exports = handler;
