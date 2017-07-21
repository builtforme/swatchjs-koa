'use strict';

const Router = require('koa-router');

const defaults = require('./defaults');
const handlers = require('./handlers');

function expose(app, methods, options) {
  const router = new Router();

  options = defaults(options);

  const swatchCtx = {
    authAdapter: options.authAdapter,
  };

  methods.forEach(addMethod);

  function addMethod(method) {
    options.verbs.forEach(addRoute);

    function addRoute(verb) {
      verb = verb.trim();
      const handler = handlers[verb](swatchCtx, method);
      const path = `${options.prefix}${method.name}`;

      router[verb](path, handler);
    }
  }

  app.use(router.routes());
}

module.exports = expose;
