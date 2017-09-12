const response = require('../response');

function handler(requestHandler, successResponse, errorResponse) {
  async function handleRequest(koaCtx) {
    try {
      const result = await requestHandler(koaCtx);
      successResponse(koaCtx, result);
    } catch (error) {
      errorResponse(koaCtx, error);
    }
  }

  return handleRequest;
}

function raw(requestHandler) {
  return handler(
    requestHandler,
    response.rawResponse,
    response.rawResponse,
  );
}

function wrapped(requestHandler) {
  return handler(
    requestHandler,
    response.successResponse,
    response.errorResponse,
  );
}

module.exports = {
  raw,
  wrapped,
};
