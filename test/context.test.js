const chai = require('chai');

const context = require('../lib/context');

const expect = chai.expect;

describe('context', () => {
  it('should initialize the swatchCtx', (done) => {
    const exampleUrl = 'http://localhost:1234/some/path?name=test';

    const options = {
      onException: () => ('mapped_error'),
    };
    const fn = context.init(options);

    const ctx = {
      request: {
        href: exampleUrl,
        host: 'localhost:1234',
        headers: { authorization: 'value' },
        method: 'GET',
        origin: '',
        path: 'some/path',
        protocol: 'http',
        query: '?name=test',
        secure: false,
        url: exampleUrl,
      },
    };
    fn(ctx, () => {}).then(() => {
      const error = ctx.swatchCtx.request.onException('error');
      expect(error).to.equal('mapped_error');

      expect(ctx.swatchCtx.req.href).to.equal(exampleUrl);
      expect(ctx.swatchCtx.req.host).to.equal('localhost:1234');
      expect(ctx.swatchCtx.req.method).to.equal('GET');
      expect(ctx.swatchCtx.req.origin).to.equal('');
      expect(ctx.swatchCtx.req.path).to.equal('some/path');
      expect(ctx.swatchCtx.req.protocol).to.equal('http');
      expect(ctx.swatchCtx.req.query).to.equal('?name=test');
      expect(ctx.swatchCtx.req.secure).to.equal(false);
      expect(ctx.swatchCtx.req.url).to.equal(exampleUrl);

      expect(ctx.swatchCtx.req.headers.authorization).to.equal('value');

      done();
    }).catch(done);
  });
});
