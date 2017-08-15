const expect = require('chai').expect;
const swatch = require('swatchjs');
const handlers = require('../../lib/handlers');

function invokeHandler(fn, verb, expected) {
  const params = { a: 1, b: 2 };
  const request = {
    get body() {
      return params;
    },
  };
  const koaCtx = {
    get query() {
      return params;
    },
    get request() {
      return request;
    },
    set body(res) {
      expect(res).to.deep.equal(expected);
    },
  };

  const model = swatch({
    fn: {
      handler: fn,
    },
  });
  const handler = handlers[verb](model[0]);

  return handler(koaCtx);
}

function invokeErrorHandler(fn, verb) {
  const expected = {
    ok: false,
    error: 'some_error: 3',
  };
  return invokeHandler(fn, verb, expected);
}

describe('handlers', () => {
  describe('index', () => {
    it('should contain all verbs', () => {
      expect(handlers).to.be.an('object').that.has.all.keys('get', 'post');
    });
  });

  describe('verbs', () => {
    Object.keys(handlers).forEach((verb) => {
      describe(verb, () => {
        it('should write a JSON success response if function succeeds', (done) => {
          const fn = (a, b) => a + b;
          const expected = {
            ok: true,
            result: 3,
          };

          invokeHandler(fn, verb, expected).then(done);
        });

        it('should write a JSON error response if function fails with Error', (done) => {
          const fn = (a, b) => {
            throw new Error(`some_error: ${a + b}`);
          };
          invokeErrorHandler(fn, verb).then(done);
        });
      });
    });
  });
});
