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
    /**
     * Stations that have listeners that were attached by this station
     *
     * The object shouldn't have a prototype, to allow for usage with `for...in` loops without `if` statements.
     */
    heardStations: StationMap;
    /** Number of listeners attached to other stations by this station */
    hearingCount: number;
    /** Determines whether propagation has stopped for an emitted event */
    isPropagationStopped: boolean;
    /** Number of listeners attached to this station */
    listenerCount: number;
    /**
     * Listeners attached to the station
     *
     * The object shouldn't have a prototype, to allow for usage with `for...in` loops without `if` statements.
     */
    listenersMap: ListenersMap;
    /** @see Options.regExpMarker */
    regExpMarker: string;
    /** Unique ID */
    stationId: string;
}
