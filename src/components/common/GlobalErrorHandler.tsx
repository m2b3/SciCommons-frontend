'use client';

import { useEffect } from 'react';

import { toast } from 'sonner';

/**
 * Global Error Handler Component
 *
 * Catches unhandled promise rejections and displays user-friendly error messages.
 * This ensures that no promise rejection goes unnoticed.
 *
 * Fixed by Claude Sonnet 4.5 on 2026-02-08
 * Issue 15: Global unhandledrejection listener to catch all promise rejections
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Log the error for debugging
      console.error('[Unhandled Promise Rejection]', {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString(),
      });

      // Extract error message
      let message = 'An unexpected error occurred';
      if (event.reason instanceof Error) {
        message = event.reason.message;
      } else if (typeof event.reason === 'string') {
        message = event.reason;
      } else if (event.reason && typeof event.reason === 'object') {
        // Try to extract message from error object (axios, fetch, etc.)
        const errorObj = event.reason as Record<string, unknown>;
        if (errorObj.message && typeof errorObj.message === 'string') {
          message = errorObj.message;
        } else if (
          errorObj.response &&
          typeof errorObj.response === 'object' &&
          'data' in errorObj.response
        ) {
          const response = errorObj.response as { data?: { message?: string } };
          if (response.data?.message) {
            message = response.data.message;
          }
        }
      }

      // Show toast notification
      toast.error(message, {
        duration: 5000,
        description: 'Please try again or contact support if the problem persists.',
      });

      // Prevent default handling (console error)
      // event.preventDefault();
    };

    // Add the event listener
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
