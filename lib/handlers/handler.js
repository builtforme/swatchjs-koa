'use strict';

function handler(ctx, params, method) {
  return Promise
    .resolve(params)
    .then(args => {
      return method.handle(args);
    }).then(result => {
      ctx.body = {
        ok: true,
        result,
      };
    }).catch(error => {
      ctx.body = {
        ok: false,
        error: (error && error.message) || error,
      };
    });
}

module.exports = handler;
