'use strict';

function handler(swatchCtx, koaCtx, params, method) {
  return Promise
    .resolve()
    .then(() => {
      // Extract auth/credentials from KOA request ctx
      return swatchCtx.authAdapter(koaCtx);
    }).then(auth => {
      // Run any middleware registered for endpoint
      const middleware = method.middleware;
      middleware.forEach(fn => fn(koaCtx, auth));

      return params;
    }).then(args => {
      // Pass args into handler and process request
      return method.handle(args);
    }).then(result => {
      koaCtx.body = {
        ok: true,
        result,
      };
    }).catch(error => {
      koaCtx.body = {
        ok: false,
        error: (error && error.message) || error,
      };
    });
}

module.exports = handler;
