import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validateEmail,
  validateMaxLength,
  validateMinLength,
} from './validation';

describe('validateRequired', () => {
  it('returns invalid for empty string', () => {
    expect(validateRequired('')).toEqual({ valid: false, error: 'Field is required' });
  });

  it('returns invalid for whitespace-only string', () => {
    expect(validateRequired('   ')).toEqual({ valid: false, error: 'Field is required' });
  });

  it('returns valid for non-empty string', () => {
    expect(validateRequired('hello')).toEqual({ valid: true, error: '' });
  });

  it('uses provided field name in error message', () => {
    expect(validateRequired('', 'Name').error).toBe('Name is required');
  });
});

describe('validateEmail', () => {
  it('returns invalid for empty email', () => {
    expect(validateEmail('')).toEqual({ valid: false, error: 'Email is required' });
  });

  it('returns invalid for malformed email', () => {
    expect(validateEmail('not-an-email')).toEqual({ valid: false, error: 'Invalid email address' });
  });

  it('returns invalid for email without domain', () => {
    expect(validateEmail('user@')).toEqual({ valid: false, error: 'Invalid email address' });
  });

  it('returns valid for correct email', () => {
    expect(validateEmail('user@example.com')).toEqual({ valid: true, error: '' });
  });

  it('returns valid for email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toEqual({ valid: true, error: '' });
  });
});

describe('validateMaxLength', () => {
  it('returns invalid when value exceeds max', () => {
    const result = validateMaxLength('hello world', 5, 'Input');
    expect(result).toEqual({ valid: false, error: 'Input must be 5 characters or fewer' });
  });

  it('returns valid when value equals max', () => {
    expect(validateMaxLength('hello', 5)).toEqual({ valid: true, error: '' });
  });

  it('returns valid when value is under max', () => {
    expect(validateMaxLength('hi', 10)).toEqual({ valid: true, error: '' });
  });
});

describe('validateMinLength', () => {
  it('returns invalid when trimmed value is below min', () => {
    const result = validateMinLength('hi', 5, 'Password');
    expect(result).toEqual({ valid: false, error: 'Password must be at least 5 characters' });
  });

  it('returns valid when value meets min', () => {
    expect(validateMinLength('hello', 5)).toEqual({ valid: true, error: '' });
  });

  it('returns valid when value exceeds min', () => {
    expect(validateMinLength('hello world', 5)).toEqual({ valid: true, error: '' });
  });
});
