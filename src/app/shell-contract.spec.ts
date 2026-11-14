import { ApiError } from './shell-contract';
import { asApiError } from './shell-contract';

describe('asApiError', () => {
  it('passes through an ApiError coming from the shell', () => {
    const err: ApiError = {
      status: 404,
      code: 'NOT_FOUND',
      message: 'Ticket not found',
      details: [],
      traceId: 't-1',
      userMessage: 'We could not find your ticket.',
    };

    expect(asApiError(err)).toBe(err);
  });

  it('wraps an unknown error with a fallback userMessage', () => {
    const wrapped = asApiError('boom');

    expect(wrapped.status).toBe(0);
    expect(wrapped.code).toBe('UNKNOWN');
    expect(wrapped.userMessage).toBe('Algo salió mal. Intenta de nuevo.');
  });

  it('keeps the trace id and the code of an error that lost its user message', () => {
    const wrapped = asApiError({ status: 503, code: 'UPSTREAM_DOWN', message: 'down', traceId: 't-9', details: [{ field: 'a', message: 'b' }, {}] });

    expect(wrapped.status).toBe(503);
    expect(wrapped.code).toBe('UPSTREAM_DOWN');
    expect(wrapped.traceId).toBe('t-9');
    expect(wrapped.details).toEqual([{ field: 'a', message: 'b' }]);
    expect(wrapped.userMessage).toBe('Algo salió mal. Intenta de nuevo.');
  });

  it('does not take an object for a shell error just because it has a userMessage', () => {
    const wrapped = asApiError({ userMessage: 'hi', status: 'x', traceId: 7 });

    expect(wrapped.status).toBe(0);
    expect(wrapped.code).toBe('UNKNOWN');
    expect(wrapped.traceId).toBe('');
    expect(wrapped.userMessage).toBe('hi');
  });

  it('wraps null and undefined', () => {
    expect(asApiError(null).code).toBe('UNKNOWN');
    expect(asApiError(undefined).message).toBe('undefined');
  });
});
