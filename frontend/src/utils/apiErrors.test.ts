import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { getApiErrorMessage } from './apiErrors';

const axiosErrorWith = (status: number, data: unknown): AxiosError =>
  new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    statusText: '',
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe('getApiErrorMessage', () => {
  it('surfaces the backend detail for a 503 LLM outage', () => {
    const error = axiosErrorWith(503, {
      error: 'LLM backend unavailable',
      detail: "Ollama returned status 404 for model 'llama3.2:1b'. Run: ollama pull llama3.2:1b",
    });
    expect(getApiErrorMessage(error)).toBe(
      "Ollama returned status 404 for model 'llama3.2:1b'. Run: ollama pull llama3.2:1b"
    );
  });

  it('flattens FastAPI validation errors', () => {
    const error = axiosErrorWith(422, {
      detail: [{ loc: ['body', 'prompt_type'], msg: 'Input should be a valid enum member', type: 'enum' }],
    });
    expect(getApiErrorMessage(error)).toBe('prompt_type: Input should be a valid enum member');
  });

  it('explains a network failure when there is no response', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(getApiErrorMessage(error)).toBe('Could not reach the backend API (Network Error)');
  });

  it('falls back to a generic message for unknown errors', () => {
    expect(getApiErrorMessage(new Error('kaboom'))).toBe('kaboom');
    expect(getApiErrorMessage(undefined)).toBe('Unexpected error');
  });
});
