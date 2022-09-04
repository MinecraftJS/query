import { createSocket, Socket } from 'node:dgram';
import { EventEmitter } from 'node:events';
import TypedEmitter from 'typed-emitter';
import { packets } from './protocol';
import { QueryPacketReader } from './protocol/PacketReader';
import { QueryPacketWriter } from './protocol/PacketWriter';
import { generateSessionId } from './utils/sessionId';

export class QueryClient extends (EventEmitter as new () => TypedEmitter<QueryClientEvents>) {
  /** Host this client is linked to */
  public readonly host: string;
  /** Port this client is linked to */
  public readonly port: number;
  /** The session ID is used identify your requests */
  public readonly sessionId: number;

  /** Whether or not this `QueryClient` is currently connected */
  public connected: boolean;

  private options: QueryClientOptions;
  /** UDP Socket */
  private socket: Socket;
  private packetReader: QueryPacketReader;
  private packetWriter: QueryPacketWriter;
  /** Current challenge token used to send stat requests */
  private challengeToken: number;

  public constructor(host: string, port = 25565, options: QueryClientOptions) {
    super();
    this.options = options ?? {};

    this.host = host;
    this.port = port;
    this.sessionId = this.options.sessionId ?? generateSessionId();

    this.socket = createSocket('udp4');
    this.packetReader = new QueryPacketReader(false);
    this.packetWriter = new QueryPacketWriter(this.sessionId, true);

    this.socket.on('connect', () => {
      this.connected = true;
      this.emit('connect');
    });

    this.socket.on('close', () => {
      this.connected = false;
      this.emit('disconnect');
    });

    this.socket.on('message', (message) => {
      this.emit('raw_message', message);

      this.packetReader.read(message);
    });
  }

  public connect(): QueryClient {
    this.socket.connect(this.port, this.host);
    this.emit('connect');
    return this;
  }

  public connectAsync(): Promise<QueryClient> {
    return new Promise((resolve, reject) => {
      this.socket.once('connect', async () => {
        await this.handshake();
        resolve(this);
      });
      this.socket.once('error', reject);
      this.connect();
    });
  }

  public getBasicStat(): void {
    const packet = this.packetWriter.write('BasicStatRequestPacket', {
      challengeToken: this.challengeToken,
    });
    this.write(packet);
  }

  public getBasicStatAsync(): Promise<
    InstanceType<typeof packets['BasicStatResponsePacket']>['data']
  > {
    return new Promise((resolve) => {
      this.packetReader.once('BasicStatResponsePacket', (packet) => {
        resolve(packet.data);
      });

      this.getBasicStat();
    });
  }

  public getFullStat(): void {
    const packet = this.packetWriter.write('FullStatRequestPacket', {
      challengeToken: this.challengeToken,
    });
    this.write(packet);
  }

  public getFullStatAsync(): Promise<
    InstanceType<typeof packets['FullStatResponsePacket']>['data']
  > {
    return new Promise((resolve) => {
      this.packetReader.on('FullStatResponsePacket', (packet) => {
        resolve(packet.data);
      });

      this.getFullStat();
    });
  }

  private handshake(): Promise<void> {
    return new Promise((resolve) => {
      this.packetReader.once('QueryHandshakeResponsePacket', (packet) => {
        this.challengeToken = packet.data.challengeToken;
        resolve();
      });

      const packet = this.packetWriter.write('QueryHandshakeRequestPacket', {});
      this.write(packet);
    });
  }

  private write(message: Buffer): void {
    this.socket.send(message);
  }
}

export interface QueryClientOptions {
  sessionId?: number;
}

type QueryClientEvents = {
  connect: () => void;
  disconnect: () => void;
  raw_message: (message: Buffer) => void;
};
