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
    expect(wrapped.userMessage).toBe('Something went wrong.');
  });
});
