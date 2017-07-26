'use strict';

const expect = require('chai').expect;

const swatchCtx = require('../lib/context');

describe('swatchCtx', () => {
  const testKoaCtx = {
    testValue: 10,
    testAsyncValue: 20,
    testErrorValue: 30,
    testThrownValue: 40,
  };

  it('should successfully execute the auth adapter and return promise', (done) => {
    const options = {
      authAdapter: (koaCtx) => {
        return Promise.resolve(koaCtx.testValue);
      }
    }

    const ctx = swatchCtx(options);
    ctx.authAdapter(testKoaCtx).then(res => {
      expect(res).to.equal(10);
      done();
    })
  });

  it('should successfully promise-ify the auth adapter function', (done) => {
    const options = {
      authAdapter: (koaCtx) => {
        return koaCtx.testAsyncValue;
      }
    }

    const ctx = swatchCtx(options);
    ctx.authAdapter(testKoaCtx).then(res => {
      expect(res).to.equal(20);
      done();
    })
  });

  it('should handle rejected promises in the auth adapter function', (done) => {
    const options = {
      authAdapter: (koaCtx) => {
        return Promise.reject(koaCtx.testErrorValue);
      }
    };

    const ctx = swatchCtx(options);
    ctx.authAdapter(testKoaCtx).catch(err => {
      expect(err).to.equal(30);
      done();
    })
  });

  it('should handle thrown errors in the auth adapter function', (done) => {
    const options = {
      authAdapter: (koaCtx) => {
        throw koaCtx.testThrownValue;
      }
    };

    const ctx = swatchCtx(options);
    ctx.authAdapter(testKoaCtx).catch(err => {
      expect(err).to.equal(40);
      done();
    })
  });
});
