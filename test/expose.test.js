'use strict';

const koa = require('koa');
const chai = require('chai');
const http = require('http');
const swatch = require('swatchjs');
const request = require('supertest');

const expose = require('../lib/expose');
const handlers = require('../lib/handlers');

const expect = chai.expect;

function getModel() {
  const model = swatch({
    "add": {
      handler: (a, b) => a + b,
    },
    "sub": {
      handler: (a, b) => a - b,
    },
  });

  return model;
};

describe('expose', () => {
  it('should only register the requested verbs', () => {
    const app = new koa();
    const model = getModel();
    const options = {
      verbs: [ 'get' ],
    };

    expose(app, model, options);

    const router = app.middleware[0].router
    expect(router.match('/add', 'GET').route).to.be.true;
    expect(router.match('/sub', 'GET').route).to.be.true;
  });

  it('should register all verbs if no verbs were specified', () => {
    const app = new koa();
    const model = getModel();

    expose(app, model);

    const router = app.middleware[0].router

    Object.keys(handlers).forEach(verb => {
      expect(router.match('/add', verb.toUpperCase()).route).to.be.true;
      expect(router.match('/sub', verb.toUpperCase()).route).to.be.true;
    });
  });

  it('should use the specified prefix', () => {
    const app = new koa();
    const model = getModel();

    const prefix = 'api';
    const options = {
      prefix,
    };

    expose(app, model, options);

    const router = app.middleware[0].router

    Object.keys(handlers).forEach(verb => {
      expect(router.match(`/${prefix}/add`, verb.toUpperCase()).route).to.be.true;
      expect(router.match(`/${prefix}/sub`, verb.toUpperCase()).route).to.be.true;
    });
  });

  it('should support an auth adapter with middleware', (done) => {
    // Define an authAdapter that returns a simple auth object
    //  Define one middleware fn to copy auth info to response body
    const app = new koa();
    const model = swatch({
      "add": {
        handler: () => {
          return 10;
        },
        middleware: [
          (ctx, next) => {
            ctx.body = {
              id: ctx.swatchCtx.auth.id,
              auth: ctx.swatchCtx.auth.auth,
            };
            next();
          }
        ]
      },
    });
    const options = {
      authAdapter: (ctx) => {
        return {
          id: 12345,
          auth: true,
        };
      },
    };

    expose(app, model, options);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.id).to.equal(12345);
        expect(res.body.auth).to.equal(true);
        done();
      });
  });

  it('should support an async auth adapter with middleware', (done) => {
    // Define an authAdapter that returns a simple auth object
    //  Define one middleware fn to copy auth info to response body
    const app = new koa();
    const model = swatch({
      "add": {
        handler: () => {
          return 10;
        },
        middleware: [
          (ctx, next) => {
            ctx.body = {
              id: ctx.swatchCtx.auth.id,
              auth: ctx.swatchCtx.auth.auth,
            };
            next();
          }
        ]
      },
    });
    const options = {
      authAdapter: (ctx) => {
        return Promise.resolve({
          id: 12345,
          auth: true,
        });
      },
    };

    expose(app, model, options);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.id).to.equal(12345);
        expect(res.body.auth).to.equal(true);
        done();
      });
  });

  it('should return an error when handler throws an error', (done) => {
    // Define a sync handler that throws an exception
    const app = new koa();
    const model = swatch({
      "add": {
        handler: () => {
          throw 'sync_whoops';
        },
      },
    });

    expose(app, model);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.ok).to.equal(false);
        expect(res.body.error).to.equal('sync_whoops');
        done();
      });
    });

    it('should return success from an async handler', (done) => {
      const app = new koa();
      const model = swatch({
        "add": {
          handler: () => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(100);
              }, 1);
            });
          }
        },
      });

      expose(app, model);

      request(http.createServer(app.callback()))
        .get('/add')
        .expect(200)
        .end((err, res) => {
          expect(err).to.equal(null);
          expect(res.body.ok).to.equal(true);
          expect(res.body.error).to.equal(100);
          done();
        });
    });

  it('should return an error when handler throws an error inside a promise', (done) => {
    // Define an async function that throws a exception from inside a promise
    const app = new koa();
    const model = swatch({
      "add": {
        handler: () => {
          return Promise.resolve('async_whoops').then(msg => {
            throw msg;
          });
        },
      },
    });

    expose(app, model);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.ok).to.equal(false);
        expect(res.body.error).to.equal('async_whoops');
        done();
      });
    });

  it('should return an error when auth adapter throws an error', (done) => {
    // Define an authAdapter that throws an exception
    //  Define one middleware fn that should not run
    const app = new koa();
    const model = swatch({
      "add": {
        handler: () => {
          return 10;
        },
        middleware: [
          (ctx, next) => {
            ctx.body = {
              id: ctx.swatchCtx.auth.id,
              auth: ctx.swatchCtx.auth.auth,
            };
            next();
          }
        ]
      },
    });
    const options = {
      authAdapter: (ctx) => {
        throw new Error('invalid_auth_whoops');
      },
    };

    expose(app, model, options);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.ok).to.equal(false);
        expect(res.body.error).to.equal('invalid_auth_whoops');
        done();
      });
    });

  it('should return an error when any middleware throws an error', (done) => {
    // Define an authAdapter that works correctly
    //  Define one middleware fn that throws an error
    const app = new koa();
    const model = swatch({
      "add": {
        handler: () => {
          return 10;
        },
        middleware: [
          (ctx, next) => {
            throw new Error('invalid_middleware_oops');
          }
        ]
      },
    });
    const options = {
      authAdapter: (ctx) => {
        return {
          id: 12345,
          auth: true,
        };
      },
    };

    expose(app, model, options);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.ok).to.equal(false);
        expect(res.body.error).to.equal('invalid_middleware_oops');
        done();
      });
  });
});
