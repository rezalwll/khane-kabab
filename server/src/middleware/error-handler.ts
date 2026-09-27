import type { Context } from 'hono';
import type pino from 'pino';
import { ApiError } from '../lib/errors.js';
import type { AppVariables } from './request-id.js';
import { reportUnexpectedError } from '../lib/report-error.js';
export function errorHandler(logger: pino.Logger) {
  return (error: Error, c: Context<{ Variables: AppVariables }>) => {
    const requestId = c.get('requestId') || 'unknown';
    if (error instanceof ApiError)
      return c.json(
        { error: { code: error.code, message: error.message, requestId } },
        error.status,
      );
    reportUnexpectedError(logger, error, { requestId, area: 'request' });
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'خطای داخلی سرور رخ داد.',
          requestId,
        },
      },
      500,
    );
  };
}
