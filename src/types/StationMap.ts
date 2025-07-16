import type { Emitter } from "./Emitter";

/** An object of station instances with unique station IDs as keys */
export interface StationMap<EVT> {
  [stationId: string]: Emitter<EVT>;
}
