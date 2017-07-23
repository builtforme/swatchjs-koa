'use strict';

const expect = require('chai').expect;
const swatch = require('swatchjs');
const handlers = require('../../lib/handlers');

describe('handlers', () => {
  describe('index', () => {
    it('should contain all verbs', () => {
      expect(handlers).to.be.an('object').that.has.all.keys('get', 'post');
    });
  });

  describe('verbs', () => {
    Object.keys(handlers).forEach(verb => {
      describe(verb, () => {
        it('should write a JSON success response if function succeeds', done => {
          const fn = (a, b) => a + b;
          const expected = {
            ok: true,
            result: 3,
          };

          invokeHandler(fn, verb, expected, done);
        });

        it('should write a JSON error response if function fail', done => {
          const fn = (a, b) => { throw 'some_error'; };
          const expected = {
            ok: false,
            error: 'some_error',
          };

          invokeHandler(fn, verb, expected, done);
        });
      });
    });
  });
});

function invokeHandler(fn, verb, expected, done) {
  const params = {a: 1, b: 2};
  const request = {
    get body() {
      return params;
    },
  };
  const ctx = {
    get query() {
      return params;
    },
    get request() {
      return request;
    },
    set body(res) {
      expect(res).to.deep.equal(expected);
      done();
    },
  };

  const model = swatch({
    fn: fn,
  });
  const swatchCtx = {
    authAdapter: function() { return {}; },
  };
  const handler = handlers[verb](swatchCtx, model[0]);

  handler(ctx);
}
