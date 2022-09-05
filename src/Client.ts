import { createSocket, Socket } from 'node:dgram';
import { EventEmitter } from 'node:events';
import TypedEmitter from 'typed-emitter';
import { packets, QueryPacketReader, QueryPacketWriter } from './protocol';
import { generateSessionId } from './utils/sessionId';

/**
 * `QueryClient` class
 * @see https://wiki.vg/Query
 */
export class QueryClient extends (EventEmitter as new () => TypedEmitter<QueryClientEvents>) {
  /** Host this client is linked to */
  public readonly host: string;
  /** Port this client is linked to */
  public readonly port: number;
  /** The session ID is used identify your requests */
  public readonly sessionId: number;

  /** Whether or not this `QueryClient` is currently connected */
  public connected: boolean;

  /** Options applied to this `QueryClient` */
  private options: QueryClientOptions;
  /** UDP Socket */
  private socket: Socket;
  /** `QueryPacketReader` instance used to read received packets */
  private packetReader: QueryPacketReader;
  /** `QueryPacketWriter` instance used to write packets */
  private packetWriter: QueryPacketWriter;
  /** Current challenge token used to send stat requests */
  private challengeToken: number;

  /**
   * Instanciate a new `QueryClient` instance.
   *
   * The client is not automatically connected to the target.
   * Use the `QueryClient#connect` or `QueryClient#connectAsync`
   * to connect
   * @example
   * ```javascript
   * const client = new QueryClient('127.0.0.1');
   * await client.connectAsync();
   *
   * const stats = await client.getFullStatAsync();
   * // or run other commands
   * ```
   * @param host Host to connect to
   * @param port Port to connect on, defaults to 25565
   * @param options Options to pass to this instance
   */
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

  /**
   * Connect to the target server.
   * You must listen for the `connect`
   * even in order to make sure the client
   * is correctly connected.
   * @returns This instance
   */
  public connect(): QueryClient {
    this.socket.connect(this.port, this.host);
    return this;
  }

  /**
   * Disconnect the socket.
   */
  public disconnect(): void {
    this.socket.disconnect();
    this.connected = false;
    this.emit('disconnect');
  }

  /**
   * Connect to the target server.
   * The promise will resolve as
   * soon as the client is connected.
   * @returns This instance as a promise
   */
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

  /**
   * Get basic statistics about the server.
   * Listen for the `raw_message` to get the
   * response.
   */
  public getBasicStat(): void {
    const packet = this.packetWriter.write('BasicStatRequestPacket', {
      challengeToken: this.challengeToken,
    });
    this.write(packet);
  }

  /**
   * Get basic statistics about the server.
   * The promise will resolve with the response
   * content, already parsed.
   * @returns The parsed response
   */
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

  /**
   * Get full statistics about the server.
   * Listen for the `raw_message` to get the
   * response.
   */
  public getFullStat(): void {
    const packet = this.packetWriter.write('FullStatRequestPacket', {
      challengeToken: this.challengeToken,
    });
    this.write(packet);
  }

  /**
   * Get full statistics about the server.
   * The promise will resolve with the response
   * content, already parsed.
   * @returns The parsed response
   */
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

  /**
   * Execute the handshake sequence.
   * The promise is resolved when the
   * sequence is completed.
   */
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

/** Options you can pass into a `QueryClient` */
export interface QueryClientOptions {
  /**
   * Override the session id. By default
   * the session id is randomly generated.
   */
  sessionId?: number;
}

type QueryClientEvents = {
  connect: () => void;
  disconnect: () => void;
  raw_message: (message: Buffer) => void;
};
