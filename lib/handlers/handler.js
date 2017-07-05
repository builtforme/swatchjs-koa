'use strict';

function handler(ctx, params, info) {
  Promise
    .resolve(params)
    .then(args => {
      return info.handle(args);
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
