const Router = require('koa-router');

const defaults = require('./defaults');
const handlers = require('./handlers');
const response = require('./response');

async function initSwatchCtx(koaCtx, next) {
  // Create the swatchCtx object on the KOA ctx
  koaCtx.swatchCtx = {};

  // Continue chain of handlers
  await next();
}

function wrapMiddleware(fn) {
  async function middlewareWrapper(koaCtx, next) {
    try {
      await fn(koaCtx, next);
    } catch (error) {
      // Auth error should trigger failure response
      response.errorResponse(koaCtx, error);
    }
  }

  return middlewareWrapper;
}

function validationMiddleware(validateFn, verb) {
  async function validationWrapper(koaCtx, next) {
    try {
      // Get the params from request body and validate
      //  Updates koaCtx.swatchCtx with validated params
      const requestParams = handlers[verb](koaCtx);
      validateFn(koaCtx, requestParams);

      await next();
    } catch (error) {
      // Validation error should trigger failure response
      response.errorResponse(koaCtx, error);
    }
  }

  return validationWrapper;
}

function expose(app, methods, opts) {
  const options = defaults(opts);

  const router = new Router();

  function addMethod(method) {
    function addRoute(supportedVerb) {
      const verb = supportedVerb.trim();
      const path = `${options.prefix}${method.name}`;

      const noAuth = method.metadata.noAuth;
      const methodMiddleware = method.metadata.middleware;

      const adapter = noAuth ?
        [initSwatchCtx] :
        [initSwatchCtx, options.authAdapter];
      const validator = adapter.concat(
        [validationMiddleware(method.validate, verb)],
      );
      const middleware = validator.concat(
        methodMiddleware.map(wrapMiddleware),
      );

      const handler = handlers.handler(method.handle);
      const handlerList = middleware.concat([handler]);

      router[verb](path, ...handlerList);
    }

    options.verbs.forEach(addRoute);
  }

  methods.forEach(addMethod);

  app.use(router.routes());
}

module.exports = expose;
