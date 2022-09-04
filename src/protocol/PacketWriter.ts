import { BufWrapper } from '@minecraft-js/bufwrapper';
import { packets } from '.';
import * as BufWrapperPlugin from './BufWrapperPlugin';
import { Magic } from './constants';

/**
 * `QueryPacketWriter` class
 * @see https://wiki.vg/Query#Base_packet_format
 */
export class QueryPacketWriter {
  /** Session ID to use when writing packet */
  public readonly sessionId: number;

  /**
   * Magic number used to prefix the packets,
   * only used when doing client to server
   * writing.
   */
  private readonly magic: Buffer;

  /**
   *
   * @param sessionId Session ID to bind to this `QueryPacketWriter`
   * @param clientToServer Whether or not this writer will be used to do client to server writing
   */
  public constructor(sessionId: number, clientToServer: boolean) {
    this.sessionId = sessionId;

    this.magic = clientToServer ? Magic : Buffer.alloc(0);
  }

  /**
   * Write a packet
   * @param packetName Name of the packet you want to write
   * @param data Data to put inside te packet
   * @returns The buffer containing the written packet
   */
  public write<T extends keyof typeof packets>(
    packetName: T,
    data: InstanceType<typeof packets[T]>['data']
  ): Buffer {
    const buf = new BufWrapper(null, {
      plugins: { query: BufWrapperPlugin },
      oneConcat: true,
    });

    const Packet = packets[packetName];
    if (!Packet)
      throw new Error(
        `Can't write unknown packet (packet=${packetName.toString()})`
      );

    buf.writeBytes(this.magic);
    buf.writeBytes([Packet.type]);
    buf.writeInt(this.sessionId);

    const packet = new Packet(buf);
    // @ts-ignore TypeScript is complaining again but it's fine
    packet.write(data);

    return buf.buffer;
  }
}
