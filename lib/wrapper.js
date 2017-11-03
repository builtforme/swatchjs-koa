const response = require('./response');

// Generic function to wrap any `fn` as middleware
//  `fn` signature accepts a ctx + next callback
//  `ctxFn` maps from koaCtx to the expect `fn` ctx
//  Catches any errors and returns an error response
function wrap(fn, ctxFn) {
  async function middlewareWrapper(koaCtx, next) {
    try {
      const ctx = ctxFn(koaCtx);
      await fn(ctx, next);
    } catch (error) {
      // Auth error should trigger failure response
      response.errorResponse(koaCtx, error);
    }
  }

  return middlewareWrapper;
}

// Wrap `fn` into middleware that accepts a KOA ctx
function wrapKoa(fn) {
  return wrap(fn, koaCtx => (koaCtx));
}

// Wrap `fn` into middleware that accepts a Swatch ctx
function wrapSwatch(fn) {
  return wrap(fn, koaCtx => (koaCtx.swatchCtx));
}


module.exports = {
  wrapKoa,
  wrapSwatch,
};
