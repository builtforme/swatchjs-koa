'use strict';

const handlers = require('./handlers');
const response = require('./response');

const SUPPORTED_VERBS = Object.keys(handlers);

function defaults(options) {
  return {
    verbs: defaultVerbs(options && options.verbs),
    prefix: defaultPrefix(options && options.prefix),
    authAdapter: defaultAuthAdapter(options && options.authAdapter),
  };
}

function defaultVerbs(requested) {
  if (requested && !(requested instanceof Array)) {
    throw TypeError('requested HTTP verbs must be an array');
  }

  // requested verbs must be supported
  requested && requested.forEach(verb => {
    if (!(verb in handlers)) {
      throw `requested verb '${verb}' is not supported`;
    }
  });

  return requested || SUPPORTED_VERBS;
}

function defaultPrefix(prefix) {
  return (prefix && `/${prefix}/`) || '/';
}

function defaultAuthAdapter(authAdapter) {
  if (authAdapter && !(typeof authAdapter === 'function')) {
    throw TypeError('function required for authAdapter');
  }

  const authAdapterFn = authAdapter || noopAuthAdapter;

  return authMiddleware;

  function noopAuthAdapter() {
    return {};
  }

  function authMiddleware(koaCtx, next) {
    return new Promise(resolve => {
      resolve(authAdapterFn(koaCtx))
    }).then(auth => {
      // Successful auth is set on swatchCtx
      if (!koaCtx.swatchCtx) {
        koaCtx.swatchCtx = {};
      }
      koaCtx.swatchCtx.auth = auth;

      // Continue chain of handlers
      return next();
    }).catch(error => {
      // Auth error should trigger failure response
      response.errorResponse(koaCtx, error);
    });
  };
}

module.exports = defaults;
