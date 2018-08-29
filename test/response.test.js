const bunyan = require('bunyan');
const sinon = require('sinon');
const { expect } = require('chai');

const response = require('../lib/response');

const logger = bunyan.createLogger({
  name: 'swatch-koa-test',
  streams: [{ path: '/dev/null' }],
});

const requestIdProp = 'x-test-prop';
const testRequestId = 'test-request-guid';

const emptyOptions = {};
const requestPropOptions = { requestIdProp };

const errorHandlerFn = response.errorResponse(emptyOptions);

function initCtx(onException, requestId) {
  return {
    body: {},
    [requestIdProp]: requestId,
    set: sinon.stub(),
    swatchCtx: {
      logger,
      request: {
        onException,
      },
    },
  };
}

describe('response', () => {
  it('should handle success response with no request ID', () => {
    // Try to find a koa request id or a client request id but none exist
    //  In this case we should not try to set a response header with a value
    const ctx = initCtx(() => {});
    const result = {
      name: 'test',
      value: 'value',
    };

    response.successResponse(requestPropOptions)(ctx, result);

    expect(ctx.body).to.deep.equal({
      ok: true,
      result,
    });
    expect(ctx.set.called).to.equal(false);
  });

  it('should handle success response with koa request guid', () => {
    // Successfully find a koa request id but no client request id
    //  In this case the koa request id should be set in the response
    const ctx = initCtx(() => {}, testRequestId);
    const result = {
      name: 'test',
      value: 'value',
    };

    response.successResponse(requestPropOptions)(ctx, result);

    expect(ctx.body).to.deep.equal({
      ok: true,
      result,
    });
    expect(ctx.set.calledWith('x-swatch-request-id', testRequestId)).to.equal(true);
  });

  it('should handle error string responses', () => {
    const error = 'error_code';
    const ctx = initCtx((arg) => { throw arg; });

    errorHandlerFn(ctx, error);

    expect(ctx.body).to.deep.equal({
      ok: false,
      error,
      details: undefined,
    });
    expect(ctx.set.called).to.equal(false);
  });

  it('should handle error object responses', () => {
    const error = 'error_code';

    const ctx = initCtx((arg) => { throw arg; });
    const errorObj = new Error(error);

    errorHandlerFn(ctx, errorObj);

    expect(ctx.body).to.deep.equal({
      ok: false,
      error,
      details: undefined,
    });
  });

  it('should handle error responses with details', () => {
    const error = 'error_code';
    const details = 'Call stack for error';

    const ctx = initCtx((arg) => { throw arg; });
    const errorObj = {
      message: error,
      details,
    };

    errorHandlerFn(ctx, errorObj);

    expect(ctx.body).to.deep.equal({
      ok: false,
      error,
      details,
    });
  });

  it('should handle error responses with mapped exceptions', () => {
    const error = 'error_code';
    const details = 'Call stack for error';

    const ctx = initCtx(() => {
      throw new Error('other_error_code');
    });
    const errorObj = {
      message: error,
      details,
    };

    errorHandlerFn(ctx, errorObj);

    expect(ctx.body).to.deep.equal({
      ok: false,
      error: 'other_error_code',
      details: undefined,
    });
  });

  it('should rescue an exception to return a value valid', () => {
    const error = 'error_code';
    const details = 'Call stack for error';
    const errorObj = {
      message: error,
      details,
    };
    const ctx = initCtx(() => ('its_actually_fine'));

    errorHandlerFn(ctx, errorObj);

    expect(ctx.body).to.deep.equal({
      ok: true,
      result: 'its_actually_fine',
    });
  });
});
