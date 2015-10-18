/**
 * Event emitter class and namespace
 */
declare class EventStation {
    /** Container for the station's context */
    stationMeta: EventStation.Meta;
    constructor(options?: EventStation.Options);
    /** An ID unique to all stations */
    stationId: string;
    /** Number of listeners attached to the station */
    listenerCount: number;
    /**
     * Number of listeners attached to other stations by the station.
     * This value is increased by using `hear()` and `hearOnce()`.
     */
    hearingCount: number;
    /** Array of event names which have listeners on the station */
    listenerEventNames: string[];
    /**
     * Creates and attaches listeners to the station
     */
    on(listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    on(eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    on(eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    /**
     * Creates and attaches listeners to the station that are applied once and removed
     */
    once(listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    once(eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    once(eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    /**
     * Removes listeners from the station that match the given arguments.
     * If no arguments are given, all listeners will be removed;
     * including listeners that were attached via `hear()` or `hearOnce()`.
     */
    off(): void;
    off(listenerMap: EventStation.CallbackMap, context?: any): void;
    off(eventNames: string[], callback?: Function, context?: any): void;
    off(eventName: string, callback?: Function, context?: any): void;
    /**
     * Creates and attaches listeners to another station.
     * Listeners attached using this method can be removed specifically by using `disregard()`.
     */
    hear(station: EventStation, listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    hear(station: EventStation, eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    hear(station: EventStation, eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    /**
     * Attaches listeners to another station that are applied once and removed
     * Listeners attached using this method can be removed specifically by using `disregard()`.
     */
    hearOnce(station: EventStation, listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    hearOnce(station: EventStation, eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    hearOnce(station: EventStation, eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    /**
     * Removes listeners from other stations that were attached by the station
     * via `hear()` and `hearOnce()`. If no arguments are given, all listeners
     * that were attached to other stations are removed.
     */
    disregard(): void;
    disregard(target: EventStation | EventStation[]): void;
    disregard(target: EventStation | EventStation[], listenerMap: EventStation.CallbackMap, context?: any): void;
    disregard(target: EventStation | EventStation[], eventNames: string[], callback?: Function, context?: any): void;
    disregard(target: EventStation | EventStation[], eventName: string, callback?: Function, context?: any): void;
    /**
     * Determines whether the station has attached listeners that match the
     * given arguments. If no arguments are given, the method determines
     * whether the station has any attached listeners.
     */
    isHeard(): boolean;
    isHeard(listenerMap: EventStation.CallbackMap, context?: any): boolean;
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
    isHearing(target: EventStation | EventStation[], listenerMap: EventStation.CallbackMap): boolean;
    isHearing(target: EventStation | EventStation[], eventNames: string[], callback?: Function): boolean;
    isHearing(target: EventStation | EventStation[], eventName: string, callback?: Function): boolean;
    /**
     * Emits events on the station.
     * Parameters after the first are passed to eachlistener's callback function.
     */
    emit(eventNames: string[], ...args: any[]): void;
    emit(eventName: string, ...args: any[]): void;
    /**
     * Creates listeners without attaching them to the station
     */
    makeListeners(listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    makeListeners(eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    makeListeners(eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    /**
     * @returns Listeners from the station that match the given arguments.
     * If no arguments are given, all listeners will be returned;
     * including listeners that were attached via `hear()` or `hearOnce()`.
     */
    getListeners(): EventStation.Listeners;
    getListeners(listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    getListeners(eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    getListeners(eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    /**
     * @returns A new Rx.Observable object from the station
     * This method is dependant on `rx`.
     * @see EventStation.inject()
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
    addListener(listener: EventStation.Listener): void;
    /**
    * Removes all listeners that match the given listener from the station
    * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
    */
    removeListener(listener: EventStation.Listener, exactMatch?: boolean): void;
    /**
    * Determines whether any listener attached to the station matches the given listener.
    * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
    */
    hasListener(listener: EventStation.Listener, exactMatch?: boolean): boolean;
}
declare namespace EventStation {
    /** Initializes the given object */
    function init(obj: any, options?: Options): void;
    /** Changes the default global configuration */
    function config(options: Options): typeof EventStation;
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
    function inject(name: 'rx', rx: any): typeof EventStation;
    function inject(name: 'Promise', Promise: any): typeof EventStation;
    function inject(name: string, obj: any): typeof EventStation;
    /**
     * Extends an object with EventStation's public members
     */
    function extend(obj: any): any;
    /**
     * A class for operations targeting a collection of listeners
     */
    class Listeners {
        /** @returns The number of listeners in the collection */
        count: number;
        /** The station which the listeners originate from */
        private originStation;
        /** An array of listeners */
        private listeners;
        constructor(originStation: EventStation, listeners: EventStation.Listener[]);
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
        moveTo(station: EventStation): Listeners;
        /**
         * Determines whether any listener in the collection matches the given listener.
         * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
         */
        has(matchingListener: EventStation.MatchListener, exactMatch?: boolean): boolean;
        /**
         * Determines whether the listeners are attached to the given station
         */
        isAttachedTo(station: EventStation): boolean;
        /**
         * Determines whether the listeners are attached to the origin station
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
         * @see EventStation.inject()
         */
        toPromises(): Array<Promise<Listener>>;
        /**
         * @returns A promise that resolves when all of the listeners
         * have been applied at least once.
         * This method is dependant on `Promise`.
         * @see EventStation.inject()
         */
        all(): Promise<Listener[]>;
        /**
         * @returns A promise that resolves when one of the listeners is applied.
         * This method is dependant on `Promise`.
         * @see EventStation.inject()
         */
        race(): Promise<Listener>;
        /**
         * Un-pauses each listener, and resets each listener's occurrence count
         */
        reset(): Listeners;
        /** Similar to Array.prototype.forEach() */
        forEach(func: EventStation.ForEachCallback): Listeners;
        /** Retrieves a listener located at the given index */
        get(index: number): Listener;
        /** Retrieves the index of the given listener */
        index(listener: Listener): number;
        /**
         * @returns A new `Listeners` object containing a clone of each Listener
         * The new object will not have an `originStation`.
         */
        clone(): Listeners;
    }
}
declare namespace EventStation {
    /** A semantic alias */
    type StationId = string;
    /**
     * A subset of the Listener interface used only for
     * comparing two Listener objects.
     * @see Listener
     * @see matchListener()
     */
    interface MatchListener {
        /** @see Listener.eventName */
        eventName?: string;
        /** @see Listener.matchCallback */
        matchCallback?: Function;
        /** @see Listener.matchContext */
        matchContext?: any;
        /** @see Listener.hearer */
        hearer?: EventStation;
    }
    /**
     * An object that holds the state of a listener.
     * Listeners can can exist while separated from a station,
     * and can be moved between stations freely.
     */
    interface Listener {
        /** An event or expression that the listener is listening to. */
        eventName: string;
        /** A function that is called when an event matching `eventName` is emitted. */
        callback?: Function;
        /** An object that is used as `this` when the `callback` is applied. */
        context?: any;
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
         * A station instance that attached the listener to it's origin station.
         */
        hearer?: EventStation;
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
        resolves?: ListenerPromiseResolve[];
        /**
         * The `Meta` of stations which the listener is attached to
         */
        stationMetas?: Meta[];
    }
    /**
     * A literal object with non-delimited event names
     * as keys and callback functions as values.
     */
    interface CallbackMap {
        [eventName: string]: Function;
    }
    /**
     * See the [configuration section](http://morrisallison.bitbucket.org/event-station/usage.html#configuration)
     * of the usage documentation for general usage.
     */
    interface Options {
        /**
         * Determines whether a station emits an `"all"` event for every event that is emitted.
         * `true` by default.
         */
        emitAllEvent?: boolean;
        /**
         * Determines whether a station can use regular expression listeners.
         * `false` by default.
         */
        enableRegExp?: boolean;
        /**
         * The character used to mark regular expression listeners.
         * `"%"` by default.
         */
        regExpMarker?: string;
        /**
         * Determines whether a station can use delimited event names.
         * `true` by default.
         */
        enableDelimiter?: boolean;
        /**
         * The character used to delimit event names in a string.
         * `" "` (space) by default.
         */
        delimiter?: string;
        [key: string]: any;
        [key: number]: void;
    }
    /** An object of listener arrays with event names and expressions as keys */
    interface ListenersMap {
        all: EventStation.Listener[];
        [eventName: string]: EventStation.Listener[];
    }
    /** An object of station instances with unique station IDs as keys */
    interface StationMap {
        [stationId: string]: EventStation;
    }
    interface Meta {
        /** Unique ID */
        stationId: StationId;
        /** Number of listeners attached to this station */
        listenerCount: number;
        /** Number of listeners attached to other stations by this station */
        hearingCount: number;
        /** Listeners attached to the station */
        listenersMap: ListenersMap;
        /** Stations that have listeners that were attached by this station */
        heardStations: StationMap;
        /** Determines whether propagation has stopped for an emitted event */
        isPropagationStopped: boolean;
        /** @see Options.emitAllEvent */
        emitAllEvent: boolean;
        /** @see Options.enableRegExp */
        enableRegExp: boolean;
        /** @see Options.regExpMarker */
        regExpMarker: string;
        /** @see Options.enableDelimiter */
        enableDelimiter: boolean;
        /** @see Options.delimiter */
        delimiter: string;
    }
    interface ListenerArguments {
        [index: number]: any;
        length: number;
    }
    interface ListenerPromiseResolve {
        (value?: Listener | Thenable<Listener>): void;
    }
    interface ForEachCallback {
        (listener: Listener, index: number, listeners: EventStation.Listener[]): any;
    }
}
export = EventStation;
