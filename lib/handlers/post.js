'use strict';

const handler = require('./handler');

function post(swatchCtx, method) {
  return postHandler;

  function postHandler(koaCtx, next) {
    return handler(swatchCtx, koaCtx, koaCtx.request.body, method);
  }
}

module.exports = post;
