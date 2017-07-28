'use strict';

const Router = require('koa-router');

const defaults = require('./defaults');
const handlers = require('./handlers');

function expose(app, methods, options) {
  options = defaults(options);

  const router = new Router();

  methods.forEach(addMethod);

  function addMethod(method) {
    options.verbs.forEach(addRoute);

    function addRoute(verb) {
      verb = verb.trim();

      const path = `${options.prefix}${method.name}`;
      const adapter = options.authAdapter;
      const middleware = method.middleware;
      const handler = handlers[verb](method);

      router[verb](path, adapter, ...middleware, handler);
    }
  }

  app.use(router.routes());
}

module.exports = expose;
