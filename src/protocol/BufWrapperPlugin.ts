import { BufWrapper } from '@minecraft-js/bufwrapper';

/**
 * Read a C string from the buffer
 * (null terminated string)
 * @returns The read string
 */
export function readCString(this: BufWrapper): string {
  const bytes: number[] = [];

  while (true) {
    const byte = this.readBytes(1)[0];

    if (byte === 0) break;
    bytes.push(byte);
  }

  return Buffer.from(bytes).toString();
}

/**
 * Write a C string into the buffer
 * (null terminated string)
 * @param value Value to write
 */
export function writeCString(this: BufWrapper, value: string): void {
  const buffer = Buffer.alloc(Buffer.byteLength(value) + 1);
  buffer.write(value);
  this.writeToBuffer(buffer);
}

/**
 * Read a little-endian short
 * from the buffer.
 * @returns The read number
 */
export function readShortLE(this: BufWrapper): number {
  const bytes = this.readBytes(2);
  return bytes.readInt16LE();
}

/**
 * Write a little-endian short
 * into the buffer.
 * @param value Value to write
 */
export function writeShortLE(this: BufWrapper, value: number): void {
  const buffer = Buffer.alloc(2);
  buffer.writeInt16LE(value);
  this.writeToBuffer(buffer);
}
