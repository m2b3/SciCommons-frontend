import { toast } from 'sonner';

/**
 * Mutation Error Handler
 *
 * Provides consistent error handling across all React Query mutations.
 * Handles various error types, logs them appropriately, and shows user-friendly messages.
 *
 * Fixed by Claude Sonnet 4.5 on 2026-02-08
 * Issue 15: Unhandled Promise Rejections - Creates global mutation error handler
 */

interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
      detail?: string;
    };
  };
  message?: string;
  name?: string;
}

/**
 * Extract a user-friendly error message from various error formats
 */
function extractErrorMessage(error: unknown): string {
  // Handle axios-style errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as ErrorResponse;
    const data = axiosError.response?.data;

    // Try various common API error message fields
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.detail) return data.detail;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred';
}

/**
 * Get HTTP status code from error if available
 */
function getStatusCode(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as ErrorResponse;
    return axiosError.response?.status;
  }
  return undefined;
}

/**
 * Determine if error should be logged (avoid noise for expected errors)
 */
function shouldLogError(statusCode: number | undefined): boolean {
  // Don't log client errors (400-499) except auth errors
  if (
    statusCode &&
    statusCode >= 400 &&
    statusCode < 500 &&
    statusCode !== 401 &&
    statusCode !== 403
  ) {
    return false;
  }
  return true;
}

/**
 * Global mutation error handler
 *
 * Use this in the onError callback of all React Query mutations to ensure
 * consistent error handling, logging, and user feedback.
 *
 * @param error - The error from the mutation
 * @param customMessage - Optional custom message to show user (defaults to extracted message)
 * @param options - Additional options
 * @param options.silent - If true, don't show toast (useful for errors handled by component)
 * @param options.logError - If true, force logging even for expected errors
 *
 * @example
 * const mutation = useMutation({
 *   mutationFn: createComment,
 *   onError: (error) => handleMutationError(error, 'Failed to create comment'),
 *   onSuccess: () => toast.success('Comment created')
 * });
 */
export function handleMutationError(
  error: unknown,
  customMessage?: string,
  options?: {
    silent?: boolean;
    logError?: boolean;
  }
): void {
  const statusCode = getStatusCode(error);
  const extractedMessage = extractErrorMessage(error);
  const messageToShow = customMessage || extractedMessage;

  // Log error if appropriate
  if (options?.logError || shouldLogError(statusCode)) {
    console.error('[Mutation Error]', {
      message: messageToShow,
      statusCode,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  // Show toast unless silent option is set
  if (!options?.silent) {
    // Use warning toast for client errors, error toast for server/network errors
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      toast.warning(messageToShow);
    } else {
      toast.error(messageToShow);
    }
  }
}

/**
 * Handle network errors specifically (for mutations that need special handling)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'NetworkError' ||
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch')
    );
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message;
    return message.includes('Network Error') || message.includes('Failed to fetch');
  }

  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const statusCode = getStatusCode(error);
  return statusCode === 401 || statusCode === 403;
}

/**
 * Create a mutation error handler with preset custom message
 * Useful for creating reusable error handlers
 *
 * @example
 * const handleCommentError = createMutationErrorHandler('Failed to save comment');
 *
 * const mutation = useMutation({
 *   mutationFn: createComment,
 *   onError: handleCommentError
 * });
 */
export function createMutationErrorHandler(
  customMessage: string,
  options?: {
    silent?: boolean;
    logError?: boolean;
  }
) {
  return (error: unknown) => handleMutationError(error, customMessage, options);
}
