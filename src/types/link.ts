export interface CreateLinkDto {
  message: string;
  expiresIn: number;
  maxVisits?: number;
  password?: string;
  oneTime?: boolean;
}

export interface CreateLinkResponse {
  code: string;
  expiresAt: string;
}

export interface LinkMessageResponse {
  message: string;
}

export interface BackendErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly userMessage: string,
    public readonly originalError?: unknown,
  ) {
    super(userMessage);
    this.name = 'ApiError';
  }
}

export interface ExpiryOption {
  label: string;
  seconds: number;
  description: string;
}

export const EXPIRY_OPTIONS: ExpiryOption[] = [
  { label: '1 hour', seconds: 3600, description: 'Expires in 60 minutes' },
  { label: '1 day', seconds: 86400, description: 'Expires in 24 hours' },
  { label: '7 days', seconds: 604800, description: 'Expires in 1 week' },
];

export interface CreatedLinkMetadata {
  code: string;
  expiresAt: string;
  expiresIn: number;
  maxVisits?: number;
  hasPassword: boolean;
  oneTime: boolean;
}
