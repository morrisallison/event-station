declare const ALL_EVENT_NAME = "all";

declare type AllEventName = typeof ALL_EVENT_NAME;

/**
 * Validates the given options
 * @throws Error
 */
declare function assertOptions<T extends typeof defaultOptions>(opts: T): void;

declare type CallbackFunction<Context, Args extends any[], ReturnValue> = (this: Context, ...args: Args) => ReturnValue;

declare namespace CallbackFunction {
    type Any = CallbackFunction<any, any[], any>;
    type ToContext<CF> = CF extends CallbackFunction<infer C, any[], any> ? C : any;
    type ToArgs<CF> = CF extends CallbackFunction<any, infer A, any> ? A : any[];
}

/**
 * A literal object with non-delimited event names
 * as keys and callback functions as values.
 */
declare type CallbackMap<EVT> = EVT extends ListenersDefinition ? Partial<Record<ListenersDefinition.ToEventName<EVT>, ListenersDefinition.ToCallbackFunction<EVT>>> : Partial<Record<string, CallbackFunction.Any>>;

declare namespace config {
    export {
        reset,
        config_2 as config,
        assertOptions,
        mergeOptions,
        ALL_EVENT_NAME,
        AllEventName,
        defaultOptions,
        globalOptions
    }
}

/** Modifies the default global configuration */
declare function config_2(opts: Options): void;

/** Container for global configuration options */
declare const defaultOptions: {
    delimiter: string;
    emitAllEvent: boolean;
    enableDelimiter: boolean;
    enableRegExp: boolean;
    regExpMarker: string;
};

/** An interface to accommodate objects that extend EventStation */
declare interface Emitter<EVT> extends EventStation<EVT> {
}

/**
 * Event emitter class and namespace
 */
export declare class EventStation<EVT = ListenersDefinition> {
    /** Container for the station's context */
    stationMeta: StationMeta<EVT>;
    constructor(options?: Options);
    /** An ID unique to all stations */
    get stationId(): string;
    /** Number of listeners attached to the station */
    get listenerCount(): number;
    /**
     * Number of listeners attached to other stations by the station.
     * This value is increased by using `hear()` and `hearOnce()`.
     */
    get hearingCount(): number;
    /** Array of event names which have listeners on the station */
    get listenerEventNames(): ListenersDefinition.ToEventName<EVT>[];
    /**
     * Creates and attaches listeners to the station
     */
    on(listenerMap: CallbackMap<EVT>, context?: any): Listeners<EVT>;
    on<TEventNames extends InputEventNames<EVT>>(eventNames: TEventNames, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventNames[number]>, context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>): Listeners<EVT>;
    on<TEventName extends InputEventName<EVT>>(eventName: TEventName, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>, context?: ListenersDefinition.PickContext<EVT, TEventName>): Listeners<EVT>;
    /**
     * Creates and attaches listeners to the station that are applied once and removed
     */
    once(listenerMap: CallbackMap<EVT>, context?: any): Listeners<EVT>;
    once<TEventNames extends InputEventNames<EVT>>(eventNames: TEventNames, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventNames[number]>, context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>): Listeners<EVT>;
    once<TEventName extends InputEventName<EVT>>(eventName: TEventName, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>, context?: ListenersDefinition.PickContext<EVT, TEventName>): Listeners<EVT>;
    /**
     * Removes listeners from the station that match the given arguments.
     * If no arguments are given, all listeners will be removed;
     * including listeners that were attached via `hear()` or `hearOnce()`.
     */
    off(): void;
    off(listenerMap: CallbackMap<EVT>, context?: any): void;
    off<TEventNames extends InputEventNames<EVT>>(eventNames: TEventNames, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventNames[number]>, context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>): void;
    off<TEventName extends InputEventName<EVT>>(eventName: TEventName, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>, context?: ListenersDefinition.PickContext<EVT, TEventName>): void;
    /**
     * Creates and attaches listeners to another station.
     * Listeners attached using this method can be removed specifically by using `disregard()`.
     */
    hear(station: Emitter<EVT>, listenerMap: CallbackMap<EVT>, context?: any): Listeners<EVT>;
    hear<TEventNames extends InputEventNames<EVT>>(station: Emitter<EVT>, eventNames: TEventNames, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventNames[number]>, context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>): Listeners<EVT>;
    hear<TEventName extends InputEventName<EVT>>(station: Emitter<EVT>, eventName: TEventName, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>, context?: ListenersDefinition.PickContext<EVT, TEventName>): Listeners<EVT>;
    /**
     * Attaches listeners to another station that are applied once and removed
     * Listeners attached using this method can be removed specifically by using `disregard()`.
     */
    hearOnce(station: Emitter<EVT>, listenerMap: CallbackMap<EVT>, context?: any): Listeners<EVT>;
    hearOnce<TEventNames extends InputEventNames<EVT>>(station: Emitter<EVT>, eventNames: TEventNames, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventNames[number]>, context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>): Listeners<EVT>;
    hearOnce<TEventName extends InputEventName<EVT>>(station: Emitter<EVT>, eventName: TEventName, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>, context?: ListenersDefinition.PickContext<EVT, TEventName>): Listeners<EVT>;
    /**
     * Removes listeners from other stations that were attached by the station
     * via `hear()` and `hearOnce()`. If no arguments are given, all listeners
     * that were attached to other stations are removed.
     */
    disregard(): void;
    disregard(target: Emitter<EVT> | Emitter<EVT>[]): void;
    disregard(target: Emitter<EVT> | Emitter<EVT>[], listenerMap: CallbackMap<EVT>, context?: any): void;
    disregard<TEventNames extends InputEventNames<EVT>>(target: Emitter<EVT> | Emitter<EVT>[], eventNames: TEventNames, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventNames[number]>, context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>): void;
    disregard<TEventName extends InputEventName<EVT>>(target: Emitter<EVT> | Emitter<EVT>[], eventName: TEventName, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>, context?: ListenersDefinition.PickContext<EVT, TEventName>): void;
    /**
     * Determines whether the station has attached listeners that match the
     * given arguments. If no arguments are given, the method determines
     * whether the station has any attached listeners.
     */
    isHeard(): boolean;
    isHeard(listenerMap: CallbackMap<EVT>, context?: any): boolean;
    isHeard<TEventNames extends InputEventNames<EVT>>(eventNames: TEventNames, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventNames[number]>, context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>): boolean;
    isHeard<TEventName extends InputEventName<EVT>>(eventName: TEventName, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>, context?: ListenersDefinition.PickContext<EVT, TEventName>): boolean;
    /**
     * Determines whether other stations have listeners matching the given
     * arguments that were attached by the station via `hear()` and `hearOnce()`.
     * If no arguments are given, the method determines whether other stations
     * have any listeners attached by the station via `hear()` and `hearOnce()`.
     */
    isHearing(): boolean;
    isHearing(target: Emitter<EVT> | Emitter<EVT>[]): boolean;
    isHearing(target: Emitter<EVT> | Emitter<EVT>[], listenerMap: CallbackMap<EVT>): boolean;
    isHearing<TEventNames extends InputEventNames<EVT>>(target: Emitter<EVT> | Emitter<EVT>[], eventNames: TEventNames, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventNames[number]>): boolean;
    isHearing<TEventName extends InputEventName<EVT>>(target: Emitter<EVT> | Emitter<EVT>[], eventName: TEventName, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>): boolean;
    /**
     * Emits events on the station.
     * Parameters after the first are passed to each listener's callback function.
     */
    emit<EventNames extends ListenersDefinition.ToEventName<EVT>[]>(eventNames: EventNames, ...args: CallbackFunction.ToArgs<ListenersDefinition.PickCallbackFunction<EVT, EventNames[number]>>): ReturnType<ListenersDefinition.PickCallbackFunction<EVT, EventNames[number]>>[];
    emit<EventName extends ListenersDefinition.ToEventName<EVT>>(eventName: EventName, ...args: CallbackFunction.ToArgs<ListenersDefinition.PickCallbackFunction<EVT, EventName>>): ReturnType<ListenersDefinition.PickCallbackFunction<EVT, EventName>>[];
    /**
     * Emits events on the station, and then completes asynchronously.
     * Parameters after the first are passed to each listener's callback function.
     * @returns A `Promise` that resolves after all of the return listener promises resolve.
     */
    emitAsync<EventNames extends ListenersDefinition.ToEventName<EVT>[]>(eventNames: EventNames, ...args: CallbackFunction.ToArgs<ListenersDefinition.PickCallbackFunction<EVT, EventNames[number]>>): Promise<Awaited<ReturnType<ListenersDefinition.PickCallbackFunction<EVT, EventNames[number]>>>[]>;
    emitAsync<EventName extends ListenersDefinition.ToEventName<EVT>>(eventName: EventName, ...args: CallbackFunction.ToArgs<ListenersDefinition.PickCallbackFunction<EVT, EventName>>): Promise<Awaited<ReturnType<ListenersDefinition.PickCallbackFunction<EVT, EventName>>>[]>;
    /**
     * Creates listeners without attaching them to the station
     */
    makeListeners(listenerMap: CallbackMap<EVT>, context?: any): Listeners<EVT>;
    makeListeners<TEventNames extends InputEventNames<EVT>>(eventNames: TEventNames, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventNames[number]>, context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>): Listeners<EVT>;
    makeListeners<TEventName extends InputEventName<EVT>>(eventName: TEventName, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>, context?: ListenersDefinition.PickContext<EVT, TEventName>): Listeners<EVT>;
    /**
     * @returns Listeners from the station that match the given arguments.
     * If no arguments are given, all listeners will be returned;
     * including listeners that were attached via `hear()` or `hearOnce()`.
     */
    getListeners(): Listeners<EVT> | undefined;
    getListeners(listenerMap: CallbackMap<EVT>, context?: any): Listeners<EVT> | undefined;
    getListeners<TEventNames extends InputEventNames<EVT>>(eventNames: TEventNames, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventNames[number]>, context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>): Listeners<EVT> | undefined;
    getListeners<TEventName extends InputEventName<EVT>>(eventName: TEventName, callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>, context?: ListenersDefinition.PickContext<EVT, TEventName>): Listeners<EVT> | undefined;
    /**
     * Stops the propagation of an emitted event. When called, this method effectively does
     * nothing if an event is not being emitted at the time.
     */
    stopPropagation(): void;
    /**
     * Adds the given listener to the station
     */
    addListener(listener: Listener<EVT>): void;
    /**
     * Removes all listeners that match the given listener from the station
     * @param exactMatch - If true, an exact value match will be performed instead of an approximate match.
     */
    removeListener(listener: Listener<EVT>, exactMatch?: boolean): void;
    /**
     * Determines whether any listener attached to the station matches the given listener.
     * @param exactMatch - If true, an exact value match will be performed instead of an approximate match.
     */
    hasListener(listener: Listener<EVT>, exactMatch?: boolean): boolean;
    /** Initializes the given object */
    static init(obj: any, options?: Options): typeof EventStation;
    /** Modifies the global configuration */
    static config(opts: Options): typeof EventStation;
    /** Resets the global configuration and injected dependencies */
    static reset(): typeof EventStation;
    /** Creates a new station with the given options */
    static create<EVT>(options?: Options): Emitter<EVT>;
}

declare interface ForEachCallback<EVT> {
    (listener: Listener<EVT>, index: number, listeners: Listener<EVT>[]): any;
}

/** Container for global configuration options */
declare const globalOptions: {
    delimiter: string;
    emitAllEvent: boolean;
    enableDelimiter: boolean;
    enableRegExp: boolean;
    regExpMarker: string;
};

/** @internal */
declare type InputEventName<EVT> = ListenersDefinition.ToEventName<EVT> | config.AllEventName;

/** @internal */
declare type InputEventNames<EVT> = (ListenersDefinition.ToEventName<EVT> | config.AllEventName)[];

/**
 * An object that holds the state of a listener.
 * Listeners can can exist while separated from a station,
 * and can be moved between stations freely.
 */
declare interface Listener<EVT> {
    /** An event or expression that the listener is listening to. */
    eventName: ListenersDefinition.ToEventName<EVT>;
    /** A function that is called when an event matching `eventName` is emitted. */
    callback?: ListenersDefinition.ToCallbackFunction<EVT>;
    /** An object that is used as `this` when the `callback` is applied. */
    context: any;
    /**
     * A function that is used when matching listener callbacks.
     * When matching, `matchCallback` is used instead of `callback`,
     * because the `callback` property can be modified by listener modifiers.
     */
    matchCallback?: ListenersDefinition.ToCallbackFunction<EVT>;
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
    hearer?: Emitter<EVT>;
    /**
     * Used in cross-emitter listeners
     * The origin station of the listener which was attached by `hearer`
     */
    crossOrigin?: Emitter<EVT>;
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
        (value: Listener<EVT> | Promise<Listener<EVT>>): void;
    }>;
    /**
     * The `Meta` of stations which the listener is attached to
     */
    stationMetas?: StationMeta<EVT>[];
}

/**
 * A class for operations targeting a collection of listeners
 */
declare class Listeners<EVT> {
    /** @returns The number of listeners in the collection */
    get count(): number;
    /** The station which the listeners originate from */
    private originStation;
    /** An array of listeners */
    private listeners;
    constructor(originStation: Emitter<EVT>, listeners: Listener<EVT>[]);
    /**
     * Sets each listener's maximum occurrence
     */
    occur(maxOccurrences: number): Listeners<EVT>;
    /**
     * Sets each listener's callback function
     */
    calling(callback: ListenersDefinition.ToCallbackFunction<EVT>): Listeners<EVT>;
    /**
     * Sets each listener's callback function, and maximum occurrence to one(1)
     */
    once(callback: ListenersDefinition.ToCallbackFunction<EVT>): Listeners<EVT>;
    /**
     * Removes the listeners from all stations
     */
    off(): Listeners<EVT>;
    /**
     * Sets the context of each listener
     */
    using(context: any): Listeners<EVT>;
    /**
     * Adds each listener to the given station
     */
    addTo(station: Emitter<EVT>): Listeners<EVT>;
    /**
     * Removes each listener from the given station
     */
    removeFrom(station: Emitter<EVT>): Listeners<EVT>;
    /**
     * Moves the listeners to another station.
     * This method changes the origin station.
     */
    moveTo(station: Emitter<EVT>): Listeners<EVT>;
    /**
     * Determines whether any listener in the collection matches the given listener.
     * @param exactMatch - If true, an exact value match will be performed instead of an approximate match.
     */
    has(matchingListener: MatchingListener<EVT>, exactMatch?: boolean): boolean;
    /**
     * Adds the listeners to the origin station
     */
    attach(): Listeners<EVT>;
    /**
     * Removes the listeners from the origin station
     */
    detach(): Listeners<EVT>;
    /**
     * Determines whether any of the listeners are attached to the given station.
     * If no station is given, the method determines whether any of the listeners
     * are attached to *any* station.
     */
    isAttachedTo(station?: Emitter<EVT>): boolean;
    /**
     * Determines whether any of the listeners are attached to the origin station
     */
    isAttached(): boolean;
    /**
     * Pauses each listener
     */
    pause(): Listeners<EVT>;
    /**
     * Un-pauses each listener
     */
    resume(): Listeners<EVT>;
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
    toPromises(): Array<Promise<Listener<EVT>>>;
    /**
     * @returns A promise that resolves when all of the listeners
     * have been applied at least once.
     * This method is dependant on `Promise`.
     * @see inject()
     */
    all(): Promise<Listener<EVT>[]>;
    /**
     * @returns A promise that resolves when one of the listeners is applied.
     * This method is dependant on `Promise`.
     * @see inject()
     */
    race(): Promise<Listener<EVT>>;
    /**
     * Un-pauses each listener, and resets each listener's occurrence count
     */
    reset(): Listeners<EVT>;
    /** Similar to Array.prototype.forEach() */
    forEach(func: ForEachCallback<EVT>): Listeners<EVT>;
    /** Retrieves a listener located at the given index */
    get(index: number): Listener<EVT>;
    /** Retrieves the index of the given listener */
    index(listener: Listener<EVT>): number | undefined;
    /**
     * @returns A new `Listeners` object containing a clone of each Listener
     */
    clone(): Listeners<EVT>;
}

declare type ListenersDefinition<E extends string = string, C = CallbackFunction.Any> = Record<E, C>;

declare namespace ListenersDefinition {
    type ToEventName<EVT> = EVT extends ListenersDefinition ? Exclude<keyof EVT, symbol | number> : string;
    type ToReturnValue<EVT> = EVT extends Record<string, CallbackFunction<any, any[], infer R>> ? R : unknown;
    type PickCallbackFunction<EVT, EventName> = EventName extends AllEventName ? CallbackFunction.Any : EventName extends keyof EVT ? EVT[EventName] extends CallbackFunction.Any ? EVT[EventName] : never : never;
    type PickContext<EVT, EventName> = EventName extends AllEventName ? any : EventName extends keyof EVT ? EVT[EventName] extends CallbackFunction.Any ? CallbackFunction.ToContext<EVT[EventName]> : never : never;
    type ToCallbackFunction<EVT> = EVT extends Record<string, CallbackFunction.Any> ? EVT[keyof EVT] : CallbackFunction.Any;
    type ToContext<EVT> = CallbackFunction.ToContext<ToCallbackFunction<EVT>>;
    type ToArgs<EVT> = CallbackFunction.ToArgs<ToCallbackFunction<EVT>>;
}

/** An object of listener arrays with event names and expressions as keys */
declare type ListenersMap<EVT> = Record<ListenersDefinition.ToEventName<EVT> | typeof ALL_EVENT_NAME | RegExpString, Listener<EVT>[]>;

/**
 * A subset of the Listener interface used only for
 * comparing two Listener objects.
 * @see Listener
 * @see matchListener()
 */
declare interface MatchingListener<EVT> {
    /** @see Listener.eventName */
    eventName?: ListenersDefinition.ToEventName<EVT>;
    /** @see Listener.matchCallback */
    matchCallback?: ListenersDefinition.ToCallbackFunction<EVT>;
    /** @see Listener.matchContext */
    matchContext?: any;
    /** @see Listener.hearer */
    hearer?: Emitter<EVT>;
}

declare function mergeOptions<T extends typeof defaultOptions>(target: any, ...sources: any[]): T;

/**
 * @see [Configuration documentation](https://github.com/morrisallison/event-station/blob/main/docs/Usage.md#configuration)
 */
declare interface Options {
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
}

/**
 * A string representing regular expression to match event names.
 * The string is denoted by the `regExpMarker` option in the configuration.
 *
 * @example
 *
 * // If the `regExpMarker` is set to `%`, then the following string
 * // represents a regular expression that matches any event name
 * // that starts with "user":
 * const regExpString: RegExpString = "%user.*";
 */
declare type RegExpString = string;

/** Resets the global configuration to defaults */
declare function reset(): void;

/** An object of station instances with unique station IDs as keys */
declare interface StationMap<EVT> {
    [stationId: string]: Emitter<EVT>;
}

declare interface StationMeta<EVT> extends Required<Options> {
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

export { }
