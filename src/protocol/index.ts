import * as clientbound from './client';
import * as serverbound from './server';

export const packets = { ...clientbound, ...serverbound };
