import { QueryPacketType } from '../constants';
import { QueryPacket } from '../Packet';

export class FullStatRequestPacket extends QueryPacket<FullStatRequest> {
  public static type = QueryPacketType.STAT;

  public write(data?: FullStatRequest): void {
    this.data = data || this.data;

    this.buf.writeInt(this.data.challengeToken);
    this.buf.writeBytes(Buffer.alloc(4));

    this.buf.finish();
  }

  public read(): FullStatRequest {
    this.data = {
      challengeToken: this.buf.readInt(),
    };

    return this.data;
  }
}

/**
 * @see https://wiki.vg/Query#Request_3
 */
interface FullStatRequest {
  challengeToken: number;
}
