import {ListenersMap} from './ListenersMap';
import {StationMap} from './StationMap';

export interface Meta {
    /** @see Options.delimiter */
    delimiter: string;
    /** @see Options.emitAllEvent */
    emitAllEvent: boolean;
    /** @see Options.enableDelimiter */
    enableDelimiter: boolean;
    /** @see Options.enableRegExp */
    enableRegExp: boolean;
    /** Stations that have listeners that were attached by this station */
    heardStations: StationMap;
    /** Number of listeners attached to other stations by this station */
    hearingCount: number;
    /** Determines whether propagation has stopped for an emitted event */
    isPropagationStopped: boolean;
    /** Number of listeners attached to this station */
    listenerCount: number;
    /** Listeners attached to the station */
    listenersMap: ListenersMap;
    /** @see Options.regExpMarker */
    regExpMarker: string;
    /** Unique ID */
    stationId: string;
}
