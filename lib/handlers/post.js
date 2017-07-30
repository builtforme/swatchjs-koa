'use strict';

const handler = require('./handler');

function post(method) {
  return postHandler;

  function postHandler(koaCtx, next) {
    return handler(koaCtx, koaCtx.request.body, method);
  }
}

module.exports = post;
