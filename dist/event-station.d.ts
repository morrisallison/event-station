/*
 * event-station v1.1.0-beta.2
 * Copyright (c) 2016 Morris Allison III <author@morris.xyz> (http://morris.xyz)
 * Released under the MIT/Expat license
 * @preserve
 */
declare module "__event-station#Emitter" {
    import { EventStation } from "__event-station#EventStation";
    /** An interface to accommodate objects that extend EventStation */
    export interface Emitter extends EventStation {
    }
}
declare module "__event-station#ListenersMap" {
    import { Listener } from "__event-station#Listener";
    /** An object of listener arrays with event names and expressions as keys */
    export interface ListenersMap {
        [eventName: string]: Listener[];
    }
}
declare module "__event-station#StationMap" {
    import { Emitter } from "__event-station#Emitter";
    /** An object of station instances with unique station IDs as keys */
    export interface StationMap {
        [stationId: string]: Emitter;
    }
}
declare module "__event-station#Meta" {
    import { ListenersMap } from "__event-station#ListenersMap";
    import { StationMap } from "__event-station#StationMap";
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
}
declare module "__event-station#Listener" {
    import { Emitter } from "__event-station#Emitter";
    import { Meta } from "__event-station#Meta";
    /**
     * An object that holds the state of a listener.
     * Listeners can can exist while separated from a station,
     * and can be moved between stations freely.
     */
    export interface Listener {
        /** An event or expression that the listener is listening to. */
        eventName: string;
        /** A function that is called when an event matching `eventName` is emitted. */
        callback?: Function;
        /** An object that is used as `this` when the `callback` is applied. */
        context: any;
        /**
         * A function that is used when matching listener callbacks.
         * When matching, `matchCallback` is used instead of `callback`,
         * because the `callback` property can be modified by listener modifiers.
         */
        matchCallback?: Function;
        /**
         * An object that is used when matching listener callbacks.
         * When matching, `matchContext` is used instead of `context`,
         * because the `context` property can be modified by listener modifiers.
         */
        matchContext?: any;
        /**
         * Used in cross-emitter listeners
         * The station that attached the listener to it's origin station.
         */
        hearer?: Emitter;
        /**
         * Used in cross-emitter listeners
         * The origin station of the listener which was attached by `hearer`
         */
        crossOrigin?: Emitter;
        /**
         * Determines whether the listener is paused.
         * `undefined` by default.
         */
        isPaused?: boolean;
        /**
         * The number of times the listener has been applied.
         * This property is `undefined` unless `maxOccurrences` is set.
         */
        occurrences?: number;
        /**
         * The maximum number of times the listener can be applied.
         * When the listener's `occurrences` property equals `maxOccurrences`,
         * The listener is removed from it's origin.
         * `undefined` by default.
         */
        maxOccurrences?: number;
        /**
         * An array of Promise `resolve()` functions that are applied
         * and removed the next time the listener's callback is applied.
         */
        resolves?: Array<{
            (value?: Listener | Promise<Listener>): void;
        }>;
        /**
         * The `Meta` of stations which the listener is attached to
         */
        stationMetas?: Meta[];
    }
}
declare module "__event-station#addListener" {
    import { Listener } from "__event-station#Listener";
    import { Meta } from "__event-station#Meta";
    /** Adds the given listener to the given station meta */
    export function addListener(stationMeta: Meta, listener: Listener): void;
}
declare module "__event-station#MatchingListener" {
    import { Emitter } from "__event-station#Emitter";
    /**
     * A subset of the Listener interface used only for
     * comparing two Listener objects.
     * @see Listener
     * @see matchListener()
     */
    export interface MatchingListener {
        /** @see Listener.eventName */
        eventName?: string;
        /** @see Listener.matchCallback */
        matchCallback?: Function;
        /** @see Listener.matchContext */
        matchContext?: any;
        /** @see Listener.hearer */
        hearer?: Emitter;
    }
}
declare module "__event-station#matchListener" {
    import { MatchingListener } from "__event-station#MatchingListener";
    /**
     * Determines whether the given listeners match by performing an approximate match
     * using the `matchCallback`, `matchContext`, `hearer`, and `eventName` properties.
     * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
     */
    export function matchListener(matchingListener: MatchingListener, attachedListener: MatchingListener, exactMatch?: boolean): boolean;
}
declare module "__event-station#removeListener" {
    import { Listener } from "__event-station#Listener";
    import { Meta } from "__event-station#Meta";
    /**
     * Removes all listeners that match the given listener from the given station meta.
     * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
     */
    export function removeListener(stationMeta: Meta, listener: Listener, exactMatch?: boolean): void;
}
declare module "__event-station#removeListenerFromAll" {
    import { Listener } from "__event-station#Listener";
    /** Removes the given listener from all of the station meta it's attached to */
    export function removeListenerFromAll(listener: Listener): void;
}
declare module "__event-station#applyListeners" {
    import { EventStation } from "__event-station#EventStation";
    import { Listener } from "__event-station#Listener";
    /** Applies the given listeners with the given arguments */
    export function applyListeners<P extends Promise<any>>(listeners: Listener[], originStation: EventStation, enableAsync: boolean, args: ListenerArguments): P[] | void;
    export interface ListenerArguments {
        [index: number]: any;
        length: number;
    }
}
declare module "__event-station#getAllListeners" {
    import { Listener } from "__event-station#Listener";
    import { Meta } from "__event-station#Meta";
    /** Retrieves all listeners attached to the given Meta */
    export function getAllListeners(stationMeta: Meta): Listener[];
}
declare module "__event-station#matchListeners" {
    import { MatchingListener } from "__event-station#MatchingListener";
    export function matchListeners(matchingListener: MatchingListener, attachedListeners: MatchingListener[], exactMatch?: boolean): boolean;
}
declare module "__event-station#hasListener" {
    import { MatchingListener } from "__event-station#MatchingListener";
    import { Meta } from "__event-station#Meta";
    /**
     * Determines whether the given listener is attached to the given station meta.
     * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
     */
    export function hasListener(stationMeta: Meta, listener: MatchingListener, exactMatch?: boolean): boolean;
}
declare module "__event-station#injection" {
    export namespace deps {
        /**
         * A reference to the injected Rx namespace.
         * @see inject()
         */
        let $RxObservable: Rx.ObservableStatic | void;
        /**
         * A reference to the Promise object, or an injected Promise-like object.
         * @see inject()
         */
        let $Promise: typeof Promise | void;
    }
    /**
     * Injects or overrides an optional dependency.
     *
     * Use this method to provide EventStation with the `rx` namespace.
     * Doing so enables the use of `Listeners.prototype.toObservable()`.
     *
     *     inject('rx', rx)
     *
     * EventStation will use the native Promise object by default.
     * If a Promise object isn't globally available, one can be
     * injected to be used in its place.
     *
     *     inject('Promise', YourPromiseObject)
     *
     * For example, Bluebird can be injected to override the Promise used
     * within EventStation instances.
     */
    export function inject(name: 'rx', rx: any): void;
    export function inject(name: 'Promise', Promise: any): void;
    export function inject(name: string, obj: any): void;
    /** Reset injected dependencies */
    export function reset(): void;
}
declare module "__event-station#Listeners" {
    import { Emitter } from "__event-station#Emitter";
    import { EventStation } from "__event-station#EventStation";
    import { Listener } from "__event-station#Listener";
    import { MatchingListener } from "__event-station#MatchingListener";
    /**
     * A class for operations targeting a collection of listeners
     */
    export class Listeners {
        /** @returns The number of listeners in the collection */
        readonly count: number;
        /** The station which the listeners originate from */
        private originStation;
        /** An array of listeners */
        private listeners;
        constructor(originStation: Emitter, listeners: Listener[]);
        /**
         * Sets each listener's maximum occurrence
         */
        occur(maxOccurrences: number): Listeners;
        /**
         * Sets each listener's callback function
         */
        calling(callback: Function): Listeners;
        /**
         * Sets each listener's callback function, and maximum occurrence to one(1)
         */
        once(callback: Function): Listeners;
        /**
         * Removes the listeners from all stations
         */
        off(): Listeners;
        /**
         * Sets the context of each listener
         */
        using(context: any): Listeners;
        /**
         * Adds each listener to the given station
         */
        addTo(station: EventStation): Listeners;
        /**
         * Removes each listener from the given station
         */
        removeFrom(station: EventStation): Listeners;
        /**
         * Moves the listeners to another station.
         * This method changes the origin station.
         */
        moveTo(station: Emitter): Listeners;
        /**
         * Determines whether any listener in the collection matches the given listener.
         * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
         */
        has(matchingListener: MatchingListener, exactMatch?: boolean): boolean;
        /**
         * Adds the listeners to the origin station
         */
        attach(): Listeners;
        /**
         * Removes the listeners from the origin station
         */
        detach(): Listeners;
        /**
         * Determines whether any of the listeners are attached to the given station.
         * If no station is given, the method determines whether any of the listeners
         * are attached to *any* station.
         */
        isAttachedTo(station?: EventStation): boolean;
        /**
         * Determines whether any of the listeners are attached to the origin station
         */
        isAttached(): boolean;
        /**
         * Pauses each listener
         */
        pause(): Listeners;
        /**
         * Un-pauses each listener
         */
        resume(): Listeners;
        /**
         * Determines whether any of listeners are paused
         */
        isPaused(): boolean;
        /**
         * @returns An iterable object (array) containing a promise
         * for each listener that resolves when said listener is applied.
         * This method is dependant on `Promise`.
         * @see inject()
         */
        toPromises(): Array<Promise<Listener>>;
        /**
         * @returns A promise that resolves when all of the listeners
         * have been applied at least once.
         * This method is dependant on `Promise`.
         * @see inject()
         */
        all(): Promise<Listener[]>;
        /**
         * @returns A promise that resolves when one of the listeners is applied.
         * This method is dependant on `Promise`.
         * @see inject()
         */
        race(): Promise<Listener>;
        /**
         * Un-pauses each listener, and resets each listener's occurrence count
         */
        reset(): Listeners;
        /** Similar to Array.prototype.forEach() */
        forEach(func: ForEachCallback): Listeners;
        /** Retrieves a listener located at the given index */
        get(index: number): Listener;
        /** Retrieves the index of the given listener */
        index(listener: Listener): number | void;
        /**
         * @returns A new `Listeners` object containing a clone of each Listener
         */
        clone(): Listeners;
    }
    /** Determines whether the given listeners are attached to any stations */
    export function isListenersAttached(listeners: Listener[]): boolean;
    /** Determines whether the given listener is attached to any stations */
    export function isListenerAttached(listener: Listener): boolean;
    export interface ForEachCallback {
        (listener: Listener, index: number, listeners: Listener[]): any;
    }
}
declare module "__event-station#makeStationId" {
    /** Generates a unique ID for EventStation instances */
    export function makeStationId(): string;
}
declare module "__event-station#options" {
    /** Container for global configuration options */
    export const defaultOptions: {
        delimiter: string;
        emitAllEvent: boolean;
        enableDelimiter: boolean;
        enableRegExp: boolean;
        regExpMarker: string;
    };
    /** Container for global configuration options */
    export const globalOptions: {
        delimiter: string;
        emitAllEvent: boolean;
        enableDelimiter: boolean;
        enableRegExp: boolean;
        regExpMarker: string;
    };
    /** Resets the global configuration to defaults */
    export function reset(): void;
    /** Modifies the default global configuration */
    export function config(opts: Options): void;
    /**
     * Validates the given options
     * @throws Error
     */
    export function assertOptions<T extends typeof defaultOptions>(opts: T): void;
    export function mergeOptions<T extends typeof defaultOptions>(target: any, ...sources: any[]): T;
    /**
    * See the [configuration section](http://morrisallison.github.io/event-station/usage.html#configuration)
    * of the usage documentation for general usage.
    */
    export interface Options {
        /**
         * The character used to delimit event names in a string.
         * `" "` (space) by default.
         */
        delimiter?: string;
        /**
         * Determines whether a station emits an `"all"` event for every event that is emitted.
         * `true` by default.
         */
        emitAllEvent?: boolean;
        /**
         * Determines whether a station can use delimited event names.
         * `true` by default.
         */
        enableDelimiter?: boolean;
        /**
         * Determines whether a station can use regular expression listeners.
         * `false` by default.
         */
        enableRegExp?: boolean;
        /**
         * A string used to mark regular expression listeners.
         * `"%"` by default.
         */
        regExpMarker?: string;
        [key: string]: string | boolean | void;
        [key: number]: void;
    }
}
declare module "__event-station#EventStation" {
    import { Emitter } from "__event-station#Emitter";
    import { Listener } from "__event-station#Listener";
    import { Listeners } from "__event-station#Listeners";
    import { Meta } from "__event-station#Meta";
    import * as options from "__event-station#options";
    /**
     * Event emitter class and namespace
     */
    export class EventStation {
        /** Container for the station's context */
        stationMeta: Meta;
        constructor(options?: options.Options);
        /** An ID unique to all stations */
        readonly stationId: string;
        /** Number of listeners attached to the station */
        readonly listenerCount: number;
        /**
         * Number of listeners attached to other stations by the station.
         * This value is increased by using `hear()` and `hearOnce()`.
         */
        readonly hearingCount: number;
        /** Array of event names which have listeners on the station */
        readonly listenerEventNames: string[];
        /**
         * Creates and attaches listeners to the station
         */
        on(listenerMap: CallbackMap, context?: any): Listeners;
        on(eventNames: string[], callback?: Function, context?: any): Listeners;
        on(eventName: string, callback?: Function, context?: any): Listeners;
        /**
         * Creates and attaches listeners to the station that are applied once and removed
         */
        once(listenerMap: CallbackMap, context?: any): Listeners;
        once(eventNames: string[], callback?: Function, context?: any): Listeners;
        once(eventName: string, callback?: Function, context?: any): Listeners;
        /**
         * Removes listeners from the station that match the given arguments.
         * If no arguments are given, all listeners will be removed;
         * including listeners that were attached via `hear()` or `hearOnce()`.
         */
        off(): void;
        off(listenerMap: CallbackMap, context?: any): void;
        off(eventNames: string[], callback?: Function, context?: any): void;
        off(eventName: string, callback?: Function, context?: any): void;
        /**
         * Creates and attaches listeners to another station.
         * Listeners attached using this method can be removed specifically by using `disregard()`.
         */
        hear(station: Emitter, listenerMap: CallbackMap, context?: any): Listeners;
        hear(station: Emitter, eventNames: string[], callback?: Function, context?: any): Listeners;
        hear(station: Emitter, eventName: string, callback?: Function, context?: any): Listeners;
        /**
         * Attaches listeners to another station that are applied once and removed
         * Listeners attached using this method can be removed specifically by using `disregard()`.
         */
        hearOnce(station: Emitter, listenerMap: CallbackMap, context?: any): Listeners;
        hearOnce(station: Emitter, eventNames: string[], callback?: Function, context?: any): Listeners;
        hearOnce(station: Emitter, eventName: string, callback?: Function, context?: any): Listeners;
        /**
         * Removes listeners from other stations that were attached by the station
         * via `hear()` and `hearOnce()`. If no arguments are given, all listeners
         * that were attached to other stations are removed.
         */
        disregard(): void;
        disregard(target: EventStation | EventStation[]): void;
        disregard(target: EventStation | EventStation[], listenerMap: CallbackMap, context?: any): void;
        disregard(target: EventStation | EventStation[], eventNames: string[], callback?: Function, context?: any): void;
        disregard(target: EventStation | EventStation[], eventName: string, callback?: Function, context?: any): void;
        /**
         * Determines whether the station has attached listeners that match the
         * given arguments. If no arguments are given, the method determines
         * whether the station has any attached listeners.
         */
        isHeard(): boolean;
        isHeard(listenerMap: CallbackMap, context?: any): boolean;
        isHeard(eventNames: string[], callback?: Function, context?: any): boolean;
        isHeard(eventName: string, callback?: Function, context?: any): boolean;
        /**
         * Determines whether other stations have listeners matching the given
         * arguments that were attached by the station via `hear()` and `hearOnce()`.
         * If no arguments are given, the method determines whether other stations
         * have any listeners attached by the station via `hear()` and `hearOnce()`.
         */
        isHearing(): boolean;
        isHearing(target: EventStation | EventStation[]): boolean;
        isHearing(target: EventStation | EventStation[], listenerMap: CallbackMap): boolean;
        isHearing(target: EventStation | EventStation[], eventNames: string[], callback?: Function): boolean;
        isHearing(target: EventStation | EventStation[], eventName: string, callback?: Function): boolean;
        /**
         * Emits events on the station.
         * Parameters after the first are passed to each listener's callback function.
         */
        emit(eventNames: string[], ...args: any[]): void;
        emit(eventName: string, ...args: any[]): void;
        /**
         * Emits events on the station, and then completes asynchronously.
         * Parameters after the first are passed to each listener's callback function.
         * @returns A `Promise` that resolves after all of the return listener promises resolve.
         */
        emitAsync<R extends any>(eventNames: string[], ...args: any[]): Promise<R[]>;
        emitAsync<R extends any>(eventName: string, ...args: any[]): Promise<R[]>;
        /**
         * Creates listeners without attaching them to the station
         */
        makeListeners(listenerMap: CallbackMap, context?: any): Listeners;
        makeListeners(eventNames: string[], callback?: Function, context?: any): Listeners;
        makeListeners(eventName: string, callback?: Function, context?: any): Listeners;
        /**
         * @returns Listeners from the station that match the given arguments.
         * If no arguments are given, all listeners will be returned;
         * including listeners that were attached via `hear()` or `hearOnce()`.
         */
        getListeners(): Listeners;
        getListeners(listenerMap: CallbackMap, context?: any): Listeners;
        getListeners(eventNames: string[], callback?: Function, context?: any): Listeners;
        getListeners(eventName: string, callback?: Function, context?: any): Listeners;
        /**
         * @returns A new Rx.Observable object from the station
         * This method is dependant on `rx`.
         * @see inject()
         */
        toObservable<T>(eventNames: string[], context?: any, selector?: (args: any[]) => T): Rx.Observable<T>;
        toObservable<T>(eventName: string, context?: any, selector?: (args: any[]) => T): Rx.Observable<T>;
        /**
         * Stops the propagation of an emitted event. When called, this method effectively does
         * nothing if an event is not being emitted at the time.
         */
        stopPropagation(): void;
        /**
         * Adds the given listener to the station
         */
        addListener(listener: Listener): void;
        /**
        * Removes all listeners that match the given listener from the station
        * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
        */
        removeListener(listener: Listener, exactMatch?: boolean): void;
        /**
        * Determines whether any listener attached to the station matches the given listener.
        * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
        */
        hasListener(listener: Listener, exactMatch?: boolean): boolean;
        /** Initializes the given object */
        static init(obj: any, options?: options.Options): typeof EventStation;
        static inject(name: string, obj: any): typeof EventStation;
        /** Modifies the global configuration */
        static config(opts: options.Options): typeof EventStation;
        /** Resets the global configuration and injected dependencies */
        static reset(): typeof EventStation;
        /**
         * Extends an object with EventStation's public members
         */
        static extend<T extends Emitter>(obj: any): T;
        static make(): Emitter;
    }
    /**
     * A literal object with non-delimited event names
     * as keys and callback functions as values.
     */
    export interface CallbackMap {
        [eventName: string]: Function;
    }
}
declare module "event-station" {
    import { EventStation } from "__event-station#EventStation";
    export { EventStation };
    export default EventStation;
}
