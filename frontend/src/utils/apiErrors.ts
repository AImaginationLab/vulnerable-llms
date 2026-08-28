import { isAxiosError } from 'axios';

interface ValidationIssue {
  loc?: Array<string | number>;
  msg?: string;
}

const isValidationIssueList = (value: unknown): value is ValidationIssue[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null);

const formatValidationIssues = (issues: ValidationIssue[]): string =>
  issues
    .map((issue) => {
      const field = (issue.loc ?? []).filter((part) => part !== 'body').join('.');
      return field ? `${field}: ${issue.msg ?? 'invalid'}` : issue.msg ?? 'invalid';
    })
    .join('; ');

/**
 * Turn any thrown value from an API call into a message worth showing a user.
 * Prefers the backend's `detail` (e.g. the 503 "LLM backend unavailable" hint),
 * flattens FastAPI validation errors, and explains network failures.
 */
export const getApiErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { detail?: unknown; error?: unknown } | undefined;

    if (typeof data?.detail === 'string') return data.detail;
    if (isValidationIssueList(data?.detail)) return formatValidationIssues(data.detail);
    if (typeof data?.error === 'string') return data.error;
    if (!error.response) return `Could not reach the backend API (${error.message})`;

    return `Request failed with status ${error.response.status}`;
  }

  if (error instanceof Error && error.message) return error.message;
  return 'Unexpected error';
};
