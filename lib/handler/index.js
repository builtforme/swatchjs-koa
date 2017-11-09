const response = require('../response');

// Depending on the configuration for each swatch endpoint, wrap
//  the request handler in a KOA-compliant function that will try
//  to execute the request and either return the expected success
//  response or an error response, which will vary based on whether
//  the endpoint returns a raw result or a wrapped Swatch result
function handler(requestHandler, successHandler, errorHandler) {
  async function handleRequest(koaCtx) {
    try {
      const result = await requestHandler(koaCtx);
      successHandler(koaCtx, result);
    } catch (error) {
      errorHandler(koaCtx, error);
    }
  }

  return handleRequest;
}

function raw(requestHandler, options) {
  return handler(
    requestHandler,
    response.rawResponse(options),
    response.rawResponse(options),
  );
}

function wrapped(requestHandler, options) {
  return handler(
    requestHandler,
    response.successResponse(options),
    response.errorResponse(options),
  );
}

module.exports = {
  raw,
  wrapped,
};
