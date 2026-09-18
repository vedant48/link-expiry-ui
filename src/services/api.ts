import { API_BASE_URL } from '../config/api';
import {
  ApiError,
  BackendErrorResponse,
  CreateLinkDto,
  CreateLinkResponse,
  LinkMessageResponse,
} from '../types/link';

/**
 * Maps HTTP status codes to clean, user-friendly messages.
 * Prevents exposing internal technical stack traces or backend leaks.
 */
function mapStatusToUserMessage(status: number, fallbackMessage?: string): string {
  switch (status) {
    case 400:
      return fallbackMessage || 'Please check the information you entered.';
    case 401:
      return 'Incorrect password. Please try again.';
    case 404:
      return 'Message not found.';
    case 410:
      return 'This message is no longer available.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Something went wrong. Please try again.';
    default:
      return fallbackMessage || 'An unexpected error occurred. Please try again.';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let errorData: BackendErrorResponse | null = null;
  let backendMsg: string | undefined;

  try {
    errorData = (await response.json()) as BackendErrorResponse;
    if (errorData?.message) {
      if (Array.isArray(errorData.message)) {
        backendMsg = errorData.message.join(', ');
      } else {
        backendMsg = errorData.message;
      }
    }
  } catch {
    // Non-JSON response
  }

  const userMessage = mapStatusToUserMessage(response.status, backendMsg);
  throw new ApiError(response.status, userMessage, errorData);
}

/**
 * Create a new temporary message
 */
export async function createLink(data: CreateLinkDto): Promise<CreateLinkResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await handleResponse<CreateLinkResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      'Unable to connect to the server. Please check your connection and try again.',
      error,
    );
  }
}

/**
 * Retrieve a temporary message by short code.
 * If protected, the backend returns 401, which will throw an ApiError with statusCode 401.
 */
export async function getLink(shortCode: string): Promise<LinkMessageResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/links/${encodeURIComponent(shortCode)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    return await handleResponse<LinkMessageResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      'Unable to connect to the server. Please check your connection and try again.',
      error,
    );
  }
}

/**
 * Access a password-protected temporary message.
 */
export async function accessProtectedLink(
  shortCode: string,
  password: string,
): Promise<LinkMessageResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/links/${encodeURIComponent(shortCode)}/access`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ password }),
      },
    );

    return await handleResponse<LinkMessageResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      'Unable to connect to the server. Please check your connection and try again.',
      error,
    );
  }
}
