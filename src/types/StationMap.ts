import {Emitter} from './Emitter';

/** An object of station instances with unique station IDs as keys */
export interface StationMap {
    [stationId: string]: Emitter;
}
