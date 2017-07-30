'use strict';

const response = require('../response');

function handler(koaCtx, params, method) {
  return Promise.resolve(params)
    .then(args => {
      return method.handle(args);
    }).then(result => {
      response.successResponse(koaCtx, result);
    }).catch(error => {
      response.errorResponse(koaCtx, error);
    });
}

module.exports = handler;
