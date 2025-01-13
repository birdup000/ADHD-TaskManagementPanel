import { AIServiceError, TimeoutError, ValidationError } from '../types/errors';

interface ErrorResponse {
  message: string;
  code?: string;
  retry?: boolean;
}

export function handleAIError(error: unknown): ErrorResponse {
  if (error instanceof AIServiceError) {
    return {
      message: error.message,
      code: error.code,
      retry: ['AI_INIT_FAILED', 'CHAT_FAILED'].includes(error.code || '')
    };
  }
  
  if (error instanceof TimeoutError) {
    return {
      message: error.message,
      code: 'TIMEOUT',
      retry: true
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: 'VALIDATION_ERROR',
      retry: false
    };
  }

  // Handle unexpected errors
  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    retry: true
  };
}