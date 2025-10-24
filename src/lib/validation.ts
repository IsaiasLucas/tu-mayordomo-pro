/**
 * Input validation and sanitization utilities
 */

/**
 * Trim and validate string input
 */
export const validateString = (
  value: string,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    required?: boolean;
  } = {}
): { valid: boolean; error?: string; value: string } => {
  const trimmed = value.trim();

  if (options.required && !trimmed) {
    return { valid: false, error: 'Este campo es requerido', value: trimmed };
  }

  if (options.minLength && trimmed.length < options.minLength) {
    return {
      valid: false,
      error: `Debe tener al menos ${options.minLength} caracteres`,
      value: trimmed,
    };
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    return {
      valid: false,
      error: `No puede exceder ${options.maxLength} caracteres`,
      value: trimmed,
    };
  }

  if (options.pattern && !options.pattern.test(trimmed)) {
    return { valid: false, error: 'Formato inválido', value: trimmed };
  }

  return { valid: true, value: trimmed };
};

/**
 * Validate email format
 */
export const validateEmail = (
  email: string
): { valid: boolean; error?: string; value: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateString(email, {
    required: true,
    maxLength: 255,
    pattern: emailRegex,
  });
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string,
  options: { minLength?: number } = {}
): { valid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' } => {
  const minLength = options.minLength || 8;

  if (password.length < minLength) {
    return {
      valid: false,
      error: `La contraseña debe tener al menos ${minLength} caracteres`,
    };
  }

  // Check password strength
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const strengthScore = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (strengthScore >= 3) strength = 'strong';
  else if (strengthScore >= 2) strength = 'medium';

  if (strengthScore < 2) {
    return {
      valid: false,
      error: 'La contraseña debe contener letras y números',
      strength: 'weak',
    };
  }

  return { valid: true, strength };
};

/**
 * Validate Chilean phone number
 */
export const validateChileanPhone = (
  phone: string
): { valid: boolean; error?: string; value: string } => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Chilean phone numbers: 9 digits starting with 9, or 8 digits for landlines
  const phoneRegex = /^(9\d{8}|\d{8})$/;

  if (!phoneRegex.test(cleaned)) {
    return {
      valid: false,
      error: 'Número de teléfono inválido',
      value: cleaned,
    };
  }

  return { valid: true, value: cleaned };
};

/**
 * Validate and format CLP amount
 */
export const validateCLPAmount = (
  value: string | number
): { valid: boolean; error?: string; value: number } => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;

  if (isNaN(numValue)) {
    return { valid: false, error: 'Monto inválido', value: 0 };
  }

  if (numValue < 0) {
    return { valid: false, error: 'El monto no puede ser negativo', value: 0 };
  }

  // CLP doesn't use decimals
  const rounded = Math.round(numValue);

  return { valid: true, value: rounded };
};

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Safe URL encoding for WhatsApp and external links
 */
export const safeEncodeURI = (text: string, maxLength: number = 500): string => {
  const truncated = text.substring(0, maxLength);
  return encodeURIComponent(truncated);
};

/**
 * Validate date is not in the future
 */
export const validatePastDate = (
  date: Date | string
): { valid: boolean; error?: string; value: Date } => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Fecha inválida', value: now };
  }

  if (dateObj > now) {
    return { valid: false, error: 'La fecha no puede ser futura', value: dateObj };
  }

  return { valid: true, value: dateObj };
};

/**
 * Rate limiter for preventing spam submissions
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Filter out old attempts
    const recentAttempts = attempts.filter((timestamp) => now - timestamp < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  reset(key: string) {
    this.attempts.delete(key);
  }

  clear() {
    this.attempts.clear();
  }
}

export const formSubmissionLimiter = new RateLimiter(3, 10000); // 3 attempts per 10 seconds
