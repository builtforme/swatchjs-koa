const bunyan = require('bunyan');
const chai = require('chai');

const middleware = require('../lib/middleware');

const expect = chai.expect;

describe('middleware', () => {
  it('should initialize the swatchCtx', (done) => {
    const options = {
      onException: () => ('mapped_error'),
    };
    const fn = middleware.swatchCtx(options);

    const ctx = {};
    fn(ctx, () => {
      const error = ctx.swatchCtx.request.onException('error');
      expect(error).to.equal('mapped_error');

      done();
    });
  });

  it('should use the provided logger', (done) => {
    const logger = bunyan.createLogger({
      name: 'swatch-koa-test',
    });
    const ctx = {
      log: logger,
      swatchCtx: {},
    };

    middleware.initLogger(ctx, () => {
      expect(ctx.swatchCtx.logger).not.to.equal(undefined);
      expect(ctx.swatchCtx.logger.fields.name).to.equal('swatch-koa-test');

      done();
    });
  });

  it('should initialize a new shared logger', (done) => {
    const ctx = {
      swatchCtx: {},
    };
    middleware.initLogger(ctx, () => {
      expect(ctx.swatchCtx.logger).not.to.equal(undefined);
      expect(ctx.swatchCtx.logger.fields.name).to.equal('swatch-koa');

      done();
    });
  });
});
