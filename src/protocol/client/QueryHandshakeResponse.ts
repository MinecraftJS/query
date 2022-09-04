import { QueryPacketType } from '../constants';
import { QueryPacket } from '../Packet';

export class QueryHandshakeResponsePacket extends QueryPacket<QueryHandshakeResponse> {
  public static type = QueryPacketType.HANDSHAKE;

  public write(data?: QueryHandshakeResponse): void {
    this.data = data || this.data;

    this.buf.plugins.query.writeCString(this.data.challengeToken.toString());

    this.buf.finish();
  }

  public read(): QueryHandshakeResponse {
    this.data = {
      challengeToken: parseInt(this.buf.plugins.query.readCString()),
    };

    return this.data;
  }
}

/**
 * @see https://wiki.vg/Query#Response
 */
interface QueryHandshakeResponse {
  challengeToken: number;
}
