import { toast } from 'sonner';

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

/**
 * Display an error message using react-hot-toast.
 * @param {ErrorResponse} error - The error object.
 * @param {string} [defaultMessage="An error occurred"] - The default message to display if no error message is found.
 */
export const showErrorToast = (
  error: ErrorResponse,
  defaultMessage: string = 'An error occurred'
): void => {
  const message = error?.response?.data?.message || defaultMessage;
  toast.error(message);
};
