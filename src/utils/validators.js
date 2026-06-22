export const CODE_REGEX = /^\d{2}[^a-zA-Z0-9]$/;

export function validateCode(code) {
  if (!code || code.length !== 3) return { valid: false, message: 'Code must be 3 characters' };
  if (!CODE_REGEX.test(code)) return { valid: false, message: 'Use 2 digits + 1 symbol (e.g., 12!)' };
  return { valid: true };
}

export function validateName(name) {
  if (!name || name.trim().length < 1) return { valid: false, message: 'Name is required' };
  if (name.trim().length > 50) return { valid: false, message: 'Name max 50 characters' };
  return { valid: true };
}