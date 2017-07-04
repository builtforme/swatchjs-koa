'use strict';

const Router = require('koa-router');

const defaults = require('./defaults');
const handlers = require('./handlers');

function expose(app, model, options) {
  const router = new Router();

  options = defaults(options);
  model.forEach(addMethod);

  function addMethod(method) {
    options.verbs.forEach(addRoute);

    function addRoute(verb) {
      verb = verb.trim();
      router[verb](`${options.prefix}${method.name}`, handlers[verb](method));
    }
  }

  app.use(router.routes());
}

module.exports = expose;
