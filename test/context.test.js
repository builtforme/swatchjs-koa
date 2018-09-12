const { expect } = require('chai');

const constants = require('../lib/constants');
const context = require('../lib/context');

describe('context', () => {
  const requestIdProp = 'test-ctx-prop';

  const exampleUrl = 'http://localhost:1234/some/path?name=test';

  function createMockContext() {
    return {
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
  }

  function verifyResult(ctx) {
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
  }

  it('should initialize the swatchCtx without a custom request id', (done) => {
    const options = {
      onException: () => ('mapped_error'),
    };
    const fn = context.init(options);

    const ctx = createMockContext();
    fn(ctx, () => {}).then(() => {
      verifyResult(ctx);
      expect(ctx[requestIdProp]).to.equal(undefined);

      done();
    }).catch(done);
  });

  it('should initialize the swatchCtx with custom request id but no value', (done) => {
    const options = {
      onException: () => ('mapped_error'),
      requestIdProp,
    };
    const fn = context.init(options);

    const ctx = createMockContext();

    fn(ctx, () => {}).then(() => {
      verifyResult(ctx);
      expect(ctx[requestIdProp]).to.equal(undefined);

      done();
    }).catch(done);
  });

  it('should initialize the swatchCtx with a custom request id', (done) => {
    const options = {
      onException: () => ('mapped_error'),
      requestIdProp,
    };
    const fn = context.init(options);

    const ctx = createMockContext();
    ctx.request.headers[constants.REQUEST_ID_HEADER_NAME] = 'test-header-guid';

    fn(ctx, () => {}).then(() => {
      verifyResult(ctx);
      expect(ctx[requestIdProp]).to.equal('test-header-guid');

      done();
    }).catch(done);
  });
});
