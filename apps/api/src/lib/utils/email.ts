/**
 * Local part, then dot-separated domain labels. Labels exclude `.` so the
 * pattern is unambiguous and cannot backtrack polynomially (CodeQL js/polynomial-redos).
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/** RFC 5321 maximum length of an email address. */
const MAX_EMAIL_LENGTH = 254;

export const isValidEmail = (email: string): boolean => {
  const trimmed = email.trim();
  return trimmed.length <= MAX_EMAIL_LENGTH && EMAIL_REGEX.test(trimmed);
};
