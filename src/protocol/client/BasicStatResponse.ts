import { QueryPacketType } from '../constants';
import { QueryPacket } from '../Packet';

export class BasicStatResponsePacket extends QueryPacket<BasicStatResponse> {
  public static type = QueryPacketType.STAT;

  public write(data?: BasicStatResponse): void {
    this.data = data || this.data;

    this.buf.plugins.query.writeCString(this.data.motd);
    this.buf.plugins.query.writeCString(this.data.gametype);
    this.buf.plugins.query.writeCString(this.data.map);
    this.buf.plugins.query.writeCString(this.data.numPlayers);
    this.buf.plugins.query.writeCString(this.data.maxPlayers);
    this.buf.plugins.query.writeShortLE(this.data.hostPort);
    this.buf.plugins.query.writeCString(this.data.hostAddress);

    this.buf.finish();
  }

  public read(): BasicStatResponse {
    this.data = {
      motd: this.buf.plugins.query.readCString(),
      gametype: this.buf.plugins.query.readCString(),
      map: this.buf.plugins.query.readCString(),
      numPlayers: this.buf.plugins.query.readCString(),
      maxPlayers: this.buf.plugins.query.readCString(),
      hostPort: this.buf.plugins.query.readShortLE(),
      hostAddress: this.buf.plugins.query.readCString(),
    };

    return this.data;
  }
}

/**
 * @see https://wiki.vg/Query#Response_2
 */
interface BasicStatResponse {
  motd: string;
  gametype: string;
  map: string;
  numPlayers: string;
  maxPlayers: string;
  hostPort: number;
  hostAddress: string;
}
