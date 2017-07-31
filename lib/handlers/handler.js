'use strict';

const response = require('../response');

function handler(koaCtx, params, method) {
  return new Promise(resolve => {
    resolve(method.handle(params))
  }).then(result => {
    response.successResponse(koaCtx, result);
  }).catch(error => {
    response.errorResponse(koaCtx, error);
  });
}

module.exports = handler;
