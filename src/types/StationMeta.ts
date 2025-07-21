import type { ListenersMap } from "./ListenersMap";
import type { StationMap } from "./StationMap";
import type { Options } from "./Options";

export interface StationMeta<EVT> extends Required<Options> {
  /**
   * Stations that have listeners that were attached by this station.
   * The object must not have a prototype.
   */
  heardStations: StationMap<EVT>;
  /**
   * Number of listeners attached to other stations by this station
   */
  hearingCount: number;
  /**
   * Determines whether propagation has stopped for an emitted event
   */
  isPropagationStopped: boolean;
  /**
   * Number of listeners attached to this station
   */
  listenerCount: number;
  /**
   * Listeners attached to the station.
   * The object must not have a prototype.
   */
  listenersMap: ListenersMap<EVT>;
  /**
   * Unique ID
   */
  stationId: string;
}
