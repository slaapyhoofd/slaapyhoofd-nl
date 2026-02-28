export interface ValidationResult {
  valid: boolean;
  error: string;
}

export function validateRequired(value: string, fieldName = 'Field'): ValidationResult {
  if (!value || !value.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true, error: '' };
}

export function validateEmail(email: string): ValidationResult {
  const required = validateRequired(email, 'Email');
  if (!required.valid) return required;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Invalid email address' };
  }
  return { valid: true, error: '' };
}

export function validateMaxLength(value: string, max: number, fieldName = 'Field'): ValidationResult {
  if (value.length > max) {
    return { valid: false, error: `${fieldName} must be ${max} characters or fewer` };
  }
  return { valid: true, error: '' };
}

export function validateMinLength(value: string, min: number, fieldName = 'Field'): ValidationResult {
  if (value.trim().length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  return { valid: true, error: '' };
}
