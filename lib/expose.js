'use strict';

const Router = require('koa-router');

const defaults = require('./defaults');
const handlers = require('./handlers');
const swatchCtx = require('./context');

function expose(app, methods, options) {
  options = defaults(options);

  const router = new Router();
  const ctx = swatchCtx(options);

  methods.forEach(addMethod);

  function addMethod(method) {
    options.verbs.forEach(addRoute);

    function addRoute(verb) {
      verb = verb.trim();
      const handler = handlers[verb](ctx, method);
      const path = `${options.prefix}${method.name}`;

      router[verb](path, handler);
    }
  }

  app.use(router.routes());
}

module.exports = expose;
