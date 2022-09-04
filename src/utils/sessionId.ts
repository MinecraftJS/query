import { randomBytes } from 'node:crypto';

/**
 * Generate a session identifier that can be
 * used in a QueryClient. The query protocol
 * only reads the lower 4 bits on each byte
 * @see https://wiki.vg/Query#Generating_a_Session_ID
 * @returns The generate session ID
 */
export function generateSessionId(): number {
  const generated = randomBytes(4).readUint32BE();
  return generated & 0x0f0f0f0f;
}
