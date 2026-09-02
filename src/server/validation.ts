// ─── Input Validation Utilities ───
// Server-side validation for all user input before it touches the database.

export const LIMITS = {
  name:            { min: 2, max: 100 },
  email:           { max: 254 },
  password:        { min: 4, max: 128 },
  phone:           { exact: 10 },
  rollNumber:      { min: 2, max: 30 },
  college:         { min: 2, max: 150 },
  cakeMessage:     { max: 45 },
  utr:             { min: 8, max: 30 },
  upiId:           { min: 3, max: 100 },
  payeeName:       { max: 100 },
  collegeName:     { min: 2, max: 150 },
  collegeCode:     { min: 1, max: 20 },
  location:        { max: 100 },
  pickupPoint:     { max: 150 },
  cakeName:        { min: 2, max: 100 },
  description:     { max: 500 },
  category:        { max: 50 },
  optionKey:       { max: 50 },
  url:             { max: 2048 },
  searchQuery:     { max: 200 },
  orderId:         { max: 20 },
  rejectionReason: { max: 500 },
} as const;

const PATTERNS = {
  email:      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone:      /^\d{10}$/,
  name:       /^[a-zA-Z\s'.,\-]+$/,
  rollNumber: /^[A-Za-z0-9\-\/]+$/,
  utr:        /^[A-Za-z0-9]+$/,
  orderId:    /^CC-\d{6}$/,
  upiId:      /^[\w.\-]+@[\w]+$/,
  date:       /^\d{4}-\d{2}-\d{2}$/,
  safeText:   /^[^<>{}]*$/,
  alphaNum:   /^[A-Za-z0-9]+$/,
  collegeCode:/^[A-Za-z0-9\-_]+$/,
};

// ─── Sanitizer ───

/** Trim and strip null bytes / zero-width chars */
export function sanitize(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim().replace(/[\x00\u200B\u200C\u200D\uFEFF]/g, '');
}

// ─── Result type (exported for cross-module narrowing) ───

export type VOk<T = string> = { valid: true; value: T };
export type VErr = { valid: false; error: string };
export type VResult<T = string> = VOk<T> | VErr;

function ok<T>(value: T): VOk<T> { return { valid: true, value }; }
function err(error: string): VErr { return { valid: false, error }; }

/** Extract error string from a failed validation result. Use when TS can't narrow the union. */
export function getError<T>(r: VResult<T>): string {
  return (r as VErr).error || 'Validation failed.';
}

// ─── Field Validators ───

export function validateEmail(raw: unknown): VResult {
  const v = sanitize(raw).toLowerCase();
  if (!v) return err('Email is required.');
  if (v.length > LIMITS.email.max) return err(`Email must be at most ${LIMITS.email.max} characters.`);
  if (!PATTERNS.email.test(v)) return err('Invalid email format.');
  return ok(v);
}

export function validatePassword(raw: unknown, label = 'Password'): VResult {
  const v = sanitize(raw);
  if (!v) return err(`${label} is required.`);
  if (v.length < LIMITS.password.min) return err(`${label} must be at least ${LIMITS.password.min} characters.`);
  if (v.length > LIMITS.password.max) return err(`${label} must be at most ${LIMITS.password.max} characters.`);
  return ok(v);
}

export function validateName(raw: unknown, label = 'Name'): VResult {
  const v = sanitize(raw);
  if (!v) return err(`${label} is required.`);
  if (v.length < LIMITS.name.min) return err(`${label} must be at least ${LIMITS.name.min} characters.`);
  if (v.length > LIMITS.name.max) return err(`${label} must be at most ${LIMITS.name.max} characters.`);
  if (!PATTERNS.name.test(v)) return err(`${label} contains invalid characters. Only letters, spaces, and basic punctuation allowed.`);
  return ok(v);
}

export function validatePhone(raw: unknown, required = true): VResult {
  const v = sanitize(raw).replace(/[\s\-()]/g, '');
  if (!v) {
    if (required) return err('Phone number is required.');
    return ok('');
  }
  if (!PATTERNS.phone.test(v)) return err('Phone must be exactly 10 digits.');
  return ok(v);
}

export function validateRollNumber(raw: unknown, required = true): VResult {
  const v = sanitize(raw).toUpperCase();
  if (!v) {
    if (required) return err('Roll number is required.');
    return ok('');
  }
  if (v.length < LIMITS.rollNumber.min) return err(`Roll number must be at least ${LIMITS.rollNumber.min} characters.`);
  if (v.length > LIMITS.rollNumber.max) return err(`Roll number must be at most ${LIMITS.rollNumber.max} characters.`);
  if (!PATTERNS.rollNumber.test(v)) return err('Roll number can only contain letters, numbers, dashes, and slashes.');
  return ok(v);
}

export function validateCollege(raw: unknown, required = true): VResult {
  const v = sanitize(raw);
  if (!v) {
    if (required) return err('College name is required.');
    return ok('');
  }
  if (v.length < LIMITS.college.min) return err(`College name must be at least ${LIMITS.college.min} characters.`);
  if (v.length > LIMITS.college.max) return err(`College name must be at most ${LIMITS.college.max} characters.`);
  if (!PATTERNS.safeText.test(v)) return err('College name contains invalid characters.');
  return ok(v);
}

export function validateCakeMessage(raw: unknown): VResult {
  const v = sanitize(raw);
  if (!v) return ok('');
  if (v.length > LIMITS.cakeMessage.max) return err(`Cake message must be at most ${LIMITS.cakeMessage.max} characters.`);
  if (!PATTERNS.safeText.test(v)) return err('Cake message contains invalid characters.');
  return ok(v);
}

export function validateUtr(raw: unknown): VResult {
  const v = sanitize(raw);
  if (!v) return err('UTR / Transaction ID is required.');
  if (v.length < LIMITS.utr.min) return err(`UTR must be at least ${LIMITS.utr.min} characters.`);
  if (v.length > LIMITS.utr.max) return err(`UTR must be at most ${LIMITS.utr.max} characters.`);
  if (!PATTERNS.utr.test(v)) return err('UTR can only contain letters and numbers.');
  return ok(v);
}

export function validateOrderId(raw: unknown): VResult {
  const v = sanitize(raw).toUpperCase();
  if (!v) return err('Order ID is required.');
  if (v.length > LIMITS.orderId.max) return err(`Order ID is too long.`);
  if (!PATTERNS.orderId.test(v)) return err('Invalid order ID format. Expected CC-XXXXXX.');
  return ok(v);
}

export function validateDate(raw: unknown, label = 'Date'): VResult {
  const v = sanitize(raw);
  if (!v) return err(`${label} is required.`);
  if (!PATTERNS.date.test(v)) return err(`${label} must be in YYYY-MM-DD format.`);
  const d = new Date(v + 'T00:00:00Z');
  if (isNaN(d.getTime())) return err(`${label} is not a valid date.`);
  return ok(v);
}

export function validateUrl(raw: unknown, required = false): VResult {
  const v = sanitize(raw);
  if (!v) {
    if (required) return err('URL is required.');
    return ok('');
  }
  if (v.length > LIMITS.url.max) return err(`URL is too long (max ${LIMITS.url.max} characters).`);
  if (!v.startsWith('http://') && !v.startsWith('https://')) return err('URL must start with http:// or https://.');
  return ok(v);
}

export function validateSafeText(raw: unknown, label: string, maxLen: number, required = false): VResult {
  const v = sanitize(raw);
  if (!v) {
    if (required) return err(`${label} is required.`);
    return ok('');
  }
  if (v.length > maxLen) return err(`${label} must be at most ${maxLen} characters.`);
  if (!PATTERNS.safeText.test(v)) return err(`${label} contains invalid characters (< > { } are not allowed).`);
  return ok(v);
}

export function validateCollegeCode(raw: unknown): VResult {
  const v = sanitize(raw).toUpperCase();
  if (!v) return ok('');
  if (v.length > LIMITS.collegeCode.max) return err(`College code must be at most ${LIMITS.collegeCode.max} characters.`);
  if (!PATTERNS.collegeCode.test(v)) return err('College code can only contain letters, numbers, dashes, and underscores.');
  return ok(v);
}

export function validateUpiId(raw: unknown, required = false): VResult {
  const v = sanitize(raw);
  if (!v) {
    if (required) return err('UPI ID is required.');
    return ok('');
  }
  if (v.length > LIMITS.upiId.max) return err(`UPI ID must be at most ${LIMITS.upiId.max} characters.`);
  if (!PATTERNS.upiId.test(v)) return err('Invalid UPI ID format (expected user@provider).');
  return ok(v);
}

export function validatePrice(raw: unknown, label = 'Price'): VResult<number> {
  const n = Number(raw);
  if (isNaN(n) || !isFinite(n)) return err(`${label} must be a valid number.`);
  if (n < 0) return err(`${label} cannot be negative.`);
  if (n > 100000) return err(`${label} exceeds maximum allowed value.`);
  return ok(n);
}

export function validateOptionArray(
  arr: unknown,
  label: string,
  required = false
): VResult<{ key: string; extra: number }[]> {
  if (!arr || !Array.isArray(arr)) {
    if (required) return err(`${label} array is required.`);
    return ok([]);
  }
  if (arr.length > 50) return err(`${label} has too many entries (max 50).`);
  const cleaned: { key: string; extra: number }[] = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const key = sanitize(item?.key);
    if (!key) return err(`${label}[${i}] key is required.`);
    if (key.length > LIMITS.optionKey.max) return err(`${label}[${i}] key is too long (max ${LIMITS.optionKey.max}).`);
    if (!PATTERNS.safeText.test(key)) return err(`${label}[${i}] key contains invalid characters.`);
    const extra = Number(item?.extra ?? item?.price ?? 0);
    if (isNaN(extra) || extra < 0 || extra > 100000) return err(`${label}[${i}] price is invalid.`);
    cleaned.push({ key, extra });
  }
  return ok(cleaned);
}

export function validateWeightArray(
  arr: unknown,
  required = false
): VResult<{ key: string; price: number }[]> {
  if (!arr || !Array.isArray(arr)) {
    if (required) return err('Weights array is required.');
    return ok([]);
  }
  if (arr.length > 20) return err('Too many weight options (max 20).');
  const cleaned: { key: string; price: number }[] = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const key = sanitize(item?.key);
    if (!key) return err(`Weight[${i}] key is required.`);
    if (key.length > LIMITS.optionKey.max) return err(`Weight[${i}] key is too long (max ${LIMITS.optionKey.max}).`);
    const price = Number(item?.price ?? 0);
    if (isNaN(price) || price < 0 || price > 100000) return err(`Weight[${i}] price is invalid.`);
    cleaned.push({ key, price });
  }
  return ok(cleaned);
}
