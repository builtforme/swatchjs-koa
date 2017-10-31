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
});
