'use strict';

const Router = require('koa-router');

const defaults = require('./defaults');
const handlers = require('./handlers');
const response = require('./response');

function expose(app, methods, options) {
  options = defaults(options);

  const router = new Router();

  methods.forEach(addMethod);

  function addMethod(method) {
    options.verbs.forEach(addRoute);

    function addRoute(verb) {
      verb = verb.trim();

      const path = `${options.prefix}${method.name}`;

      const adapter = [options.authAdapter];
      const middleware = adapter.concat(
        method.middleware.map(fn => {
          return wrapMiddleware(fn);
        })
      );
      const handler = handlers[verb](method);
      const handlerList = middleware.concat([handler]);

      router[verb](path, ...handlerList);
    }
  }

  app.use(router.routes());
}

function wrapMiddleware(fn) {
  return wrapper;

  function wrapper(koaCtx, next) {
    try {
      fn(koaCtx, next);
    } catch (error) {
      // Auth error should trigger failure response
      response.errorResponse(koaCtx, error);
    }
  }
}

module.exports = expose;
