const chai = require('chai');

const context = require('../lib/context');

const expect = chai.expect;

describe('context', () => {
  it('should initialize the swatchCtx', (done) => {
    const options = {
      onException: () => ('mapped_error'),
    };
    const fn = context.init(options);

    const ctx = {};
    fn(ctx, () => {
      const error = ctx.swatchCtx.request.onException('error');
      expect(error).to.equal('mapped_error');

      done();
    });
  });
});
