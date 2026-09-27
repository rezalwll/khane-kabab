import type pino from 'pino';

export function reportUnexpectedError(
  logger: pino.Logger,
  error: unknown,
  context: Record<string, unknown>,
) {
  const redact = (value: string | undefined) =>
    value
      ?.replace(/postgres(?:ql)?:\/\/[^\s@]+@/gi, 'postgresql://***@')
      .replace(/(password=)[^\s]+/gi, '$1***');
  const safeError =
    error instanceof Error
      ? { name: error.name, message: redact(error.message), stack: redact(error.stack) }
      : { name: 'UnknownError', message: redact(String(error)) };
  logger.error({ ...context, error: safeError }, 'unexpected error');
}
