import { BufWrapper } from '@minecraft-js/bufwrapper';
import { EventEmitter } from 'node:events';
import TypedEmitter from 'typed-emitter';
import {
  FullStatPadding,
  Magic,
  packets,
  QueryPacket,
  QueryPacketLength,
  QueryPacketType,
} from '.';
import * as BufWrapperPlugin from './BufWrapperPlugin';
import {
  BasicStatResponsePacket,
  FullStatResponsePacket,
  QueryHandshakeResponsePacket,
} from './client';
import {
  BasicStatRequestPacket,
  FullStatRequestPacket,
  QueryHandshakeRequestPacket,
} from './server';

/**
 * `QueryPacketReader` class
 * @see https://wiki.vg/Query#Base_packet_format
 */
export class QueryPacketReader extends (EventEmitter as new () => TypedEmitter<QueryPacketReaderEvents>) {
  private readonly isServer: boolean;

  public constructor(isServer: boolean) {
    super();
    this.isServer = isServer;
  }

  public read(buffer: Buffer): void {
    const buf = new BufWrapper(buffer, {
      plugins: { query: BufWrapperPlugin },
    });

    if (this.isServer) {
      const magic = buf.readBytes(2);

      if (magic.compare(Magic) !== 0)
        return process.emitWarning('Invalid magic', {
          code: 'QUERY_INVALID_MAGIC',
          detail: `Received ${magic.toString('hex')}, expected ${Magic.toString(
            'hex'
          )}`,
        });
    }

    const type: QueryPacketType = buf.readBytes(1).readInt8();
    const sessionId = buf.readInt();
    const payload = buf.buffer.subarray(buf.offset);

    let Packet: typeof QueryPacket;

    switch (type) {
      case QueryPacketType.HANDSHAKE:
        // @ts-ignore
        Packet = this.isServer
          ? QueryHandshakeRequestPacket
          : QueryHandshakeResponsePacket;
        break;

      case QueryPacketType.STAT:
        switch (payload.length) {
          case QueryPacketLength.BASIC:
            // @ts-ignore
            Packet = BasicStatRequestPacket;
            break;

          case QueryPacketLength.FULL:
            // @ts-ignore
            Packet = FullStatRequestPacket;
            break;

          default:
            if (!this.isServer) {
              const bytes = payload.subarray(0, 11);

              if (bytes.compare(FullStatPadding) === 0)
                // @ts-ignore
                Packet = FullStatResponsePacket;
              // @ts-ignore
              else Packet = BasicStatResponsePacket;

              break;
            }

            return process.emitWarning('Invalid payload length', {
              code: 'QUERY_INVALID_PAYLOAD',
              detail: `Received a payload of length ${payload.length} but should be 0, 4 or 8`,
            });
        }
        break;

      default:
        return process.emitWarning('Invalid packet type', {
          code: 'QUERY_INVALID_TYPE',
          detail: `Received a type of ${type} but should be 0 (STAT) or 9 (HANDSHAKE)`,
        });
    }

    const packet = new Packet(buf);
    packet.read();

    const event = Object.keys(packets).find((key) => packets[key] === Packet);
    // @ts-ignore Because event is type of string and not keyof typeof packets
    this.emit(event, packet, sessionId);
  }
}

type QueryPacketReaderEvents = {
  [key in keyof typeof packets]: (
    packet: InstanceType<typeof packets[key]>,
    sessionId: number
  ) => void;
};
