/**
 * Recursive input sanitizer to defend against XSS and Prototype Pollution attacks.
 * It escapes HTML tag markers from strings and strips keys like __proto__ or constructor.
 */
export function sanitizeInput(val: unknown): unknown {
  if (typeof val === 'string') {
    return val
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeInput);
  }
  if (val !== null && typeof val === 'object') {
    const res: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(val)) {
      if (key === '__proto__' || key === 'constructor') {
        continue; // Protect against Prototype Pollution
      }
      res[key] = sanitizeInput(value);
    }
    return res;
  }
  return val;
}
