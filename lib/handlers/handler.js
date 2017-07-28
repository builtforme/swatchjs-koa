'use strict';

const compose = require('koa-compose');

function handler(koaCtx, params, method) {
  return Promise.resolve(params)
    .then(args => {
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
