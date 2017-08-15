'use strict';

var handler = require('./handler');

function post(method) {
  function postHandler(koaCtx) {
    return handler(koaCtx, koaCtx.request.body, method);
  }

  return postHandler;
}

module.exports = post;