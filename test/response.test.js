const chai = require('chai');

const response = require('../lib/response');

const expect = chai.expect;

function initCtx(onException) {
  return {
    body: {},
    swatchCtx: {
      request: {
        onException,
      },
    },
  };
}

describe('response', () => {
  it('should handle success responses', () => {
    const ctx = initCtx(() => {});
    const result = {
      name: 'test',
      value: 'value',
    };

    response.successResponse(ctx, result);

    expect(ctx.body).to.deep.equal({
      ok: true,
      result,
    });
  });

  it('should handle error string responses', () => {
    const error = 'error_code';
    const ctx = initCtx(() => {});

    response.errorResponse(ctx, error);

    expect(ctx.body).to.deep.equal({
      ok: false,
      error,
      details: undefined,
    });
  });

  it('should handle error object responses', () => {
    const error = 'error_code';

    const ctx = initCtx(() => {});
    const errorObj = new Error(error);

    response.errorResponse(ctx, errorObj);

    expect(ctx.body).to.deep.equal({
      ok: false,
      error,
      details: undefined,
    });
  });

  it('should handle error responses with details', () => {
    const error = 'error_code';
    const details = 'Call stack for error';

    const ctx = initCtx(() => {});
    const errorObj = {
      message: error,
      details,
    };

    response.errorResponse(ctx, errorObj);

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

    response.errorResponse(ctx, errorObj);

    expect(ctx.body).to.deep.equal({
      ok: false,
      details,
      error: 'other_error_code',
    });
  });
});
