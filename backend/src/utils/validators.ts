/**
 * Phone number validation utility
 * Supports international format: +[country code][number]
 * Examples: +998901234567, +1234567890
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Must start with + and contain only digits after
  const phoneRegex = /^\+[1-9]\d{6,14}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Validate username format
 * - 3-50 characters
 * - Only letters, numbers, underscores
 * - Must start with a letter
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,49}$/;
  return usernameRegex.test(username);
}

/**
 * Validate display name
 * - 1-100 characters
 * - Not empty or whitespace only
 */
export function isValidDisplayName(displayName: string): boolean {
  return displayName.trim().length >= 1 && displayName.length <= 100;
}
