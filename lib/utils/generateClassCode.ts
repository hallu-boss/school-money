import { randomInt } from 'crypto';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateClassCode(): string {
  const length = 13;
  return Array.from({ length }, () => CHARS[randomInt(CHARS.length)]).join('');
}
