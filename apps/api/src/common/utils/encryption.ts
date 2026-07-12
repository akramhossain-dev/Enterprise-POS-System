import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? 'a_very_secure_default_32_chars_key!';
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const textParts = text.split(':');
    const firstPart = textParts[0];
    const secondPart = textParts[1];
    if (!firstPart || !secondPart) {
      return text;
    }
    const iv = Buffer.from(firstPart, 'hex');
    const encryptedText = Buffer.from(secondPart, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return text;
  }
}
