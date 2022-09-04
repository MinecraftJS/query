import { BufWrapper } from '@minecraft-js/bufwrapper';

export function readCString(this: BufWrapper): string {
  const bytes: number[] = [];

  while (true) {
    const byte = this.readBytes(1)[0];

    if (byte === 0) break;
    bytes.push(byte);
  }

  return Buffer.from(bytes).toString();
}

export function writeCString(this: BufWrapper, value: string): void {
  const buffer = Buffer.alloc(Buffer.byteLength(value) + 1);
  buffer.write(value);
  this.writeToBuffer(buffer);
}

export function readShortLE(this: BufWrapper): number {
  const bytes = this.readBytes(2);
  return bytes.readInt16LE();
}

export function writeShortLE(this: BufWrapper, value: number): void {
  const buffer = Buffer.alloc(2);
  buffer.writeInt16LE(value);
  this.writeToBuffer(buffer);
}
