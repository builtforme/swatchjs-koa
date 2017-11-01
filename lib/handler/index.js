const response = require('../response');

// Depending on the configuration for each swatch endpoint, wrap
//  the request handler in a KOA-compliant function that will try
//  to execute the request and either return the expected success
//  response or an error response, which will vary based on whether
//  the endpoint returns a raw result or a wrapped Swatch result
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
