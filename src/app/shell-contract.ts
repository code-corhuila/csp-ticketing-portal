/**
 * What the shell guarantees to every portal. Inside the shell, a failed request
 * reaches the portal as this object — never as a raw HttpErrorResponse — and
 * userMessage is already decided. Keep in step with csp-front/src/app/core/http/api-error.ts.
 */
export interface FieldError {
  field: string;
  message: string;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details: FieldError[];
  traceId: string;
  userMessage: string;
}

const FALLBACK_USER_MESSAGE = 'Algo salió mal. Intenta de nuevo.';

function isFieldError(value: unknown): value is FieldError {
  return typeof value === 'object'
    && value !== null
    && typeof (value as { field?: unknown }).field === 'string'
    && typeof (value as { message?: unknown }).message === 'string';
}

function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<ApiError>;
  return typeof candidate.status === 'number'
    && typeof candidate.code === 'string'
    && typeof candidate.message === 'string'
    && Array.isArray(candidate.details)
    && candidate.details.every(isFieldError)
    && typeof candidate.traceId === 'string'
    && typeof candidate.userMessage === 'string';
}

/**
 * A complete shell error passes through. Anything else is normalized field by field: what is valid is kept (the
 * trace id and the code are what support needs), what is not gets a safe default, so a drift of the shape never
 * swallows the reference of the failed request.
 */
export function asApiError(err: unknown): ApiError {
  if (isApiError(err)) return err;
  const candidate: Partial<ApiError> = typeof err === 'object' && err !== null ? (err as Partial<ApiError>) : {};
  return {
    status: typeof candidate.status === 'number' ? candidate.status : 0,
    code: typeof candidate.code === 'string' ? candidate.code : 'UNKNOWN',
    message: typeof candidate.message === 'string' ? candidate.message : typeof err === 'object' ? '' : String(err),
    details: Array.isArray(candidate.details) ? candidate.details.filter(isFieldError) : [],
    traceId: typeof candidate.traceId === 'string' ? candidate.traceId : '',
    userMessage: typeof candidate.userMessage === 'string' ? candidate.userMessage : FALLBACK_USER_MESSAGE,
  };
}
