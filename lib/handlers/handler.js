'use strict';

const compose = require('koa-compose');

function handler(swatchCtx, koaCtx, params, method) {
  // Extract auth/credentials from KOA request ctx
  return swatchCtx.authAdapter(koaCtx)
    .then(auth => {
      // Add swatchJs object on the parent context
      koaCtx.swatchJs = {
        auth,
        params,
      };

      // Run any middleware registered for endpoint
      return compose(method.middleware)(koaCtx);

    }).then(() => {
      // Finally run the handler with caller args
      return method.handle(koaCtx.swatchJs.params);
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
