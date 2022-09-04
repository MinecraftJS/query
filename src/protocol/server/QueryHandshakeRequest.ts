import { QueryPacketType } from '../constants';
import { QueryPacket } from '../Packet';

export class QueryHandshakeRequestPacket extends QueryPacket<QueryHandshakeRequest> {
  public static type = QueryPacketType.HANDSHAKE;

  public write(data?: QueryHandshakeRequest): void {
    this.buf.finish();
  }

  public read(): QueryHandshakeRequest {
    this.data = {};

    return this.data;
  }
}

/**
 * @see https://wiki.vg/Query#Request
 */
interface QueryHandshakeRequest {}
