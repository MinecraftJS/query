import { BufWrapper } from '@minecraft-js/bufwrapper';
import * as BufWrapperPlugin from './BufWrapperPlugin';
import { QueryPacketType } from './constants';

/** Class representing a packet */
export class QueryPacket<T> {
  public static type: QueryPacketType;

  /** BufWrapper instance that wraps the buffer for this packet */
  public buf: BufWrapper<{ query: typeof BufWrapperPlugin }>;
  /** Data associated to this packet */
  public data: T;

  /**
   * Read or write a packet
   * @param buf Buffer to create the packet from, can be `undefined` if you are building a packet
   */
  public constructor(buf?: BufWrapper<{ query: typeof BufWrapperPlugin }>) {
    this.buf = buf;
  }

  /**
   * Write the data to the packet
   * @param data Data to write into the packet,
   * if not present it'll use the `data` property.
   * If the `data` parameter is present, it will
   * override the `data` property.
   */
  public write(data?: T): void {
    throw new Error(
      `${
        Object.getPrototypeOf(this).constructor.name
      }#write is not implemented!`
    );
  }

  /**
   * Read the packet content
   */
  public read(): T {
    throw new Error(
      `${Object.getPrototypeOf(this).constructor.name}#read is not implemented!`
    );
  }
}
