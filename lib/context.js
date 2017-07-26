'use strict';

function swatchCtx(options) {
  return {
    authAdapter: initAuthCtx,
  };

  function initAuthCtx(koaCtx) {
    try {
      return Promise.resolve(
        options.authAdapter(koaCtx)
      )
    } catch (error) {
      return Promise.reject(error);
    }
  };
}

module.exports = swatchCtx;
