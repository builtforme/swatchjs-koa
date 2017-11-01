const Koa = require('koa');
const koaBunyanLogger = require('koa-bunyan-logger');

const bunyan = require('bunyan');
const chai = require('chai');
const http = require('http');
const swatch = require('swatchjs');
const request = require('supertest');

const expose = require('../lib/expose');

const expect = chai.expect;

const silentLogger = bunyan.createLogger({
  name: 'swatch-koa-test',
  streams: [{ path: '/dev/null' }],
});
const koaSilentLogger = koaBunyanLogger(silentLogger);

function initApp() {
  const app = new Koa();
  app.use(koaSilentLogger);
  return app;
}

function getModel() {
  const model = swatch({
    add: {
      handler: (a, b) => a + b,
    },
    sub: {
      handler: (a, b) => a - b,
    },
  });

  return model;
}

describe('expose', () => {
  it('should only register the requested verbs', () => {
    const app = initApp();
    const model = getModel();
    const options = {
      verbs: ['get'],
    };

    expose(app, model, options);

    const router = app.middleware[1].router;
    expect(router.match('/add', 'GET').route).to.equal(true);
    expect(router.match('/sub', 'GET').route).to.equal(true);
  });

  it('should register all verbs if no verbs were specified', () => {
    const app = initApp();
    const model = getModel();

    expose(app, model);

    const router = app.middleware[1].router;

    ['get', 'post'].forEach((verb) => {
      expect(router.match('/add', verb.toUpperCase()).route).to.equal(true);
      expect(router.match('/sub', verb.toUpperCase()).route).to.equal(true);
    });
  });

  it('should use the specified prefix', () => {
    const app = initApp();
    const model = getModel();

    const prefix = 'api';
    const options = {
      prefix,
    };

    expose(app, model, options);

    const router = app.middleware[1].router;

    ['get', 'post'].forEach((verb) => {
      expect(router.match(`/${prefix}/add`, verb.toUpperCase()).route).to.equal(true);
      expect(router.match(`/${prefix}/sub`, verb.toUpperCase()).route).to.equal(true);
    });
  });

  it('should support an auth adapter with middleware', (done) => {
    // Define an authAdapter that returns a simple auth object
    //  Define one middleware fn to copy auth info to response body
    const app = initApp();
    const model = swatch({
      add: {
        handler: () => (10),
        metadata: {
          middleware: [
            (swatchCtx) => {
              swatchCtx.koaCtx().body = {
                id: swatchCtx.auth.id,
                auth: swatchCtx.auth.auth,
              };
            },
          ],
        },
      },
    });
    const options = {
      authAdapter: () => ({
        id: 12345,
        auth: true,
      }),
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

  it('should skip auth adapter based on noAuth flag', (done) => {
    // Define an authAdapter that returns a simple auth object
    //  Configure the method to skip auth step and allow handler
    //  Define one middleware fn that checks if auth handler ran
    const app = initApp();
    const model = swatch({
      add: {
        handler: () => (10),
        metadata: {
          noAuth: true,
          middleware: [
            (swatchCtx) => {
              swatchCtx.koaCtx().body = {
                exists: Boolean(swatchCtx.auth),
              };
            },
          ],
        },
      },
    });
    const options = {
      authAdapter: () => ({
        id: 12345,
        auth: true,
      }),
    };

    expose(app, model, options);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.exists).to.equal(false);
        done();
      });
  });

  it('should return a raw response from successful request', (done) => {
    const val = {
      some_val: 10,
      another_val: 20,
    };

    const app = initApp();
    const model = swatch({
      add: {
        handler: () => (val),
      },
    });
    const options = {
      rawResponse: true,
    };

    expose(app, model, options);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body).to.deep.equal(val);
        expect(res.body.ok).to.equal(undefined);
        done();
      });
  });

  it('should return a raw response from a failed request', (done) => {
    const error = {
      error_val: 'raw_sync_whoops',
    };
    const app = initApp();
    const model = swatch({
      add: {
        handler: () => {
          throw error;
        },
      },
    });
    const options = {
      rawResponse: true,
    };

    expose(app, model, options);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body).to.deep.equal(error);
        expect(res.body.ok).to.equal(undefined);
        done();
      });
  });

  it('should support an async auth adapter with middleware', (done) => {
    // Define an authAdapter that returns a simple auth object
    //  Define one middleware fn to copy auth info to response body
    const app = initApp();
    const model = swatch({
      add: {
        handler: () => (10),
        metadata: {
          middleware: [
            (swatchCtx) => {
              swatchCtx.koaCtx().body = {
                id: swatchCtx.auth.id,
                auth: swatchCtx.auth.auth,
              };
            },
          ],
        },
      },
    });
    const options = {
      authAdapter: async () => (
        Promise.resolve({
          id: 12345,
          auth: true,
        })
      ),
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
    const app = initApp();
    const model = swatch({
      add: {
        handler: () => {
          throw new Error('sync_whoops');
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
    const app = initApp();
    const model = swatch({
      add: {
        handler: async () => (
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(100);
            }, 150);
          })
        ),
      },
    });

    expose(app, model);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.ok).to.equal(true);
        expect(res.body.result).to.equal(100);
        done();
      });
  });

  it('should return an error when handler throws an error inside a promise', (done) => {
    // Define an async function that throws a exception from inside a promise
    const app = initApp();
    const model = swatch({
      add: {
        handler: async () => (
          Promise.resolve('async_whoops').then((msg) => {
            throw msg;
          })
        ),
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
    const app = initApp();
    const model = swatch({
      add: {
        handler: () => (10),
        metadata: {
          middleware: [
            (swatchCtx) => {
              swatchCtx.koaCtx().body = {
                id: swatchCtx.auth.id,
                auth: swatchCtx.auth.auth,
              };
            },
          ],
        },
      },
    });
    const options = {
      authAdapter: () => {
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

  it('should return an error when validation throws an error', (done) => {
    // Define an authAdapter that works correctly
    //  Define validation that throws an error
    const app = initApp();
    const model = swatch({
      add: {
        handler: x => (x + 10),
        args: [
          {
            name: 'x',
            validate: (x) => {
              if (x < 10) {
                throw new Error('value_too_small');
              }
            },
          },
        ],
      },
    });
    const options = {
      authAdapter: () => ({
        id: 12345,
      }),
    };

    expose(app, model, options);

    request(http.createServer(app.callback()))
      .get('/add?x=1')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.ok).to.equal(false);
        expect(res.body.error).to.equal('value_too_small');
        done();
      });
  });

  it('should return an error when any middleware throws an error', (done) => {
    // Define an authAdapter that works correctly
    //  Define one middleware fn that throws an error
    const app = initApp();
    const model = swatch({
      add: {
        handler: () => (10),
        metadata: {
          middleware: [
            () => {
              throw new Error('invalid_middleware_oops');
            },
          ],
        },
      },
    });
    const options = {
      authAdapter: () => ({
        id: 12345,
        auth: true,
      }),
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

  it('should allow sync middleware before running async handler', (done) => {
    const app = initApp();
    const model = swatch({
      add: {
        handler: async () => (
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(250);
            }, 100);
          }).then(val => (val * 5))
        ),
        metadata: {
          middleware: [
            async (swatchCtx, next) => {
              swatchCtx.value = 3000;
              await next();
            },
          ],
        },
      },
    });

    expose(app, model);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.ok).to.equal(true);
        expect(res.body.result).to.equal(1250);
        done();
      });
  });

  it('should allow async middleware before running sync handler', (done) => {
    const app = initApp();
    const model = swatch({
      add: {
        handler: () => (1000),
        metadata: {
          middleware: [
            async (swatchCtx, next) => {
              const result = await Promise.resolve(2000);
              swatchCtx.value = result;

              await next();
            },
          ],
        },
      },
    });

    expose(app, model);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.ok).to.equal(true);
        expect(res.body.result).to.equal(1000);
        done();
      });
  });

  it('should allow async middleware before running async handler', (done) => {
    const app = initApp();
    const model = swatch({
      add: {
        handler: async () => (
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(1000);
            }, 100);
          }).then(val => (val * 2))
        ),
        metadata: {
          middleware: [
            async (swatchCtx, next) => {
              const result = await Promise.resolve(3000);
              swatchCtx.value = result;

              await next();
            },
          ],
        },
      },
    });

    expose(app, model);

    request(http.createServer(app.callback()))
      .get('/add')
      .expect(200)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.body.ok).to.equal(true);
        expect(res.body.result).to.equal(2000);
        done();
      });
  });
});
