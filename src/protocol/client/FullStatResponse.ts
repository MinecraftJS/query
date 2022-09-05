import { QueryPacketType } from '../constants';
import { QueryPacket } from '../Packet';

export class FullStatResponsePacket extends QueryPacket<FullStatResponse> {
  public static type = QueryPacketType.STAT;

  public write(data?: FullStatResponse): void {
    this.data = data || this.data;

    this.buf.finish();
  }

  public read(): FullStatResponse {
    this.buf.readBytes(11);

    const keyPair = {};
    while (true) {
      const key = this.buf.plugins.query.readCString();

      if (!key) break;

      const value = this.buf.plugins.query.readCString();

      // `plugins` propety requires custom parsing
      if (key === 'plugins') {
        if (!value) {
          keyPair[key] = {};
          continue;
        }

        const data: FullStatResponse['keyPair']['plugins'] = {};

        const splittedValue = value.split(':');
        data.serverMod = splittedValue[0];

        if (value.includes(':')) data.plugins = splittedValue[1].split(';');

        keyPair[key] == data;
        continue;
      }

      // Values that can be parsed to a number
      if (['numplayers', 'maxplayers', 'hostport'].includes(key)) {
        keyPair[key] = parseInt(value);
        continue;
      }

      keyPair[key] = value;
    }

    this.buf.readBytes(10);

    const players: string[] = [];
    while (true) {
      const player = this.buf.plugins.query.readCString();
      if (!player) break;

      players.push(player);
    }

    this.data = { keyPair, players };

    return this.data;
  }
}

/**
 * @see https://wiki.vg/Query#Response_3
 */
interface FullStatResponse {
  keyPair: {
    /** MOTD for the current server */
    hostname?: string;
    /** Hardcoded to SMP */
    gametype?: 'SMP';
    /**	Hardcoded to MINECRAFT */
    game_id?: 'MINECRAFT';
    /** Server version */
    version?: string;
    plugins?: {
      /** Name of the server mod */
      serverMod?: string;
      /** List of installed plugins on the server */
      plugins?: string[];
    };
    /** Name of the current map */
    map?: string;
    /** Number of online players */
    numplayers?: number;
    /** Max number of players on the server */
    maxplayers?: number;
    /** Server port */
    hostport?: number;
    /** The IP address the server is listening/was contacted on */
    hostip?: string;
  };
  players: string[];
}
