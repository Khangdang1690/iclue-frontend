/**
 * Base API Client for Next.js App Router
 * Centralizes all API calls to the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface FetchOptions extends RequestInit {
  userId?: string;
  params?: Record<string, string>;
}

/**
 * Base fetch wrapper with error handling and authentication
 */
export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { userId, params, headers, ...fetchOptions } = options;

  // Build URL with query params
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // Build headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authentication header if userId is provided
  if (userId) {
    requestHeaders['Authorization'] = `Bearer ${userId}`;
  }

  try {
    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers: requestHeaders,
      cache: options.cache || 'no-store', // Default to no-store for fresh data
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.detail || `API Error: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500
    );
  }
}

/**
 * Upload files with FormData
 */
export async function uploadFiles(
  endpoint: string,
  files: File[],
  userId: string,
  forceActions?: Record<string, 'skip' | 'replace' | 'append_anyway'>
): Promise<Response> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  // Add force_actions if provided
  if (forceActions && Object.keys(forceActions).length > 0) {
    formData.append('force_actions', JSON.stringify(forceActions));
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userId}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      errorData.detail || `Upload failed: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  return response;
}
