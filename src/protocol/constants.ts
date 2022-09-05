/** Types of the different query packets */
export enum QueryPacketType {
  STAT = 0,
  HANDSHAKE = 9,
}

/** Client to server magic number */
export const Magic = Buffer.from([0xfe, 0xfd]);

/** Client to server packet length */
export enum QueryPacketLength {
  BASIC = 4,
  FULL = 8,
}

/** Padding added to the payload of a full stat packet */
export const FullStatPadding = Buffer.from([
  0x73, 0x70, 0x6c, 0x69, 0x74, 0x6e, 0x75, 0x6d, 0x00, 0x80, 0x00,
]);
