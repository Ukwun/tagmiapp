/**
 * Safely extracts an error message from an unknown error object.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return (error as Error).message;
  return String(error);
}

/**
 * Safely extracts the stack trace from an unknown error object.
 */
export function getErrorStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}