/**
 * Maps API error codes to user-friendly UI messages.
 * Constitution: CLAUDE.md #19, #65
 */
const MESSAGES = Object.freeze({
  AUTH_001: 'This username is already taken.',
  AUTH_002: 'This email is already registered.',
  AUTH_003: 'Incorrect username or password.',
  AUTH_004: 'Your account has been deactivated.',
  RBAC_001: 'You do not have permission for this action.',
  RBAC_002: 'You cannot change your own admin role.',
  USER_001: 'User not found.',
  FINANCE_001: 'Transaction not found.',
  FINANCE_002: 'Amount must be greater than zero.',
  FINANCE_003: 'Transaction type must be income or expense.',
  VALIDATION_001: 'Please check your input and try again.',
  SYSTEM_001: 'Something went wrong. Please try again.',
  RATE_LIMIT_001: 'Too many requests. Please wait a moment.',
});

export function getErrorMessage(apiError) {
  if (!apiError) return MESSAGES.SYSTEM_001;
  return MESSAGES[apiError.code] || apiError.message || MESSAGES.SYSTEM_001;
}

export function isValidationError(apiError) {
  return apiError?.code === 'VALIDATION_001';
}
