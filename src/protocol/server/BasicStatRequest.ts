import { QueryPacketType } from '../constants';
import { QueryPacket } from '../Packet';

export class BasicStatRequestPacket extends QueryPacket<BasicStatRequest> {
  public static type = QueryPacketType.STAT;

  public write(data?: BasicStatRequest): void {
    this.data = data || this.data;

    this.buf.writeInt(this.data.challengeToken);

    this.buf.finish();
  }

  public read(): BasicStatRequest {
    this.data = {
      challengeToken: this.buf.readInt(),
    };

    return this.data;
  }
}

/**
 * @see https://wiki.vg/Query#Request_2
 */
interface BasicStatRequest {
  challengeToken: number;
}
