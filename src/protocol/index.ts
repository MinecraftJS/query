import * as clientbound from './client';
import * as serverbound from './server';

/** Object containing all the packets (clientbound and serverbound) */
export const packets = { ...clientbound, ...serverbound };

export * from './constants';
export * from './Packet';
export * from './PacketReader';
export * from './PacketWriter';
