import {addListener} from './addListener';
import {applyListeners} from './applyListeners';
import {Emitter} from './Emitter';
import {getAllListeners} from './getAllListeners';
import {hasListener} from './hasListener';
import {Listener} from './Listener';
import {Listeners} from './Listeners';
import {ListenersMap} from './ListenersMap';
import {makeStationId} from './makeStationId';
import {matchListener} from './matchListener';
import {Meta} from './Meta';
import {removeListener} from './removeListener';
import {StationMap} from './StationMap';
import * as injection from './injection';
import * as options from './options';

/**
 * Event emitter class and namespace
 */
export class EventStation {

    /** Container for the station's context */
    public stationMeta: Meta;

    constructor(options?: options.Options) {
        EventStation.init(this, options);
    }

    /** An ID unique to all stations */
    public get stationId(): string {
        return this.stationMeta.stationId;
    }

    /** Number of listeners attached to the station */
    public get listenerCount(): number {
        return this.stationMeta.listenerCount;
    }

    /**
     * Number of listeners attached to other stations by the station.
     * This value is increased by using `hear()` and `hearOnce()`.
     */
    public get hearingCount(): number {
        return this.stationMeta.hearingCount;
    }

    /** Array of event names which have listeners on the station */
    public get listenerEventNames(): string[] {
        return Object.getOwnPropertyNames(this.stationMeta.listenersMap);
    }

    /**
     * Creates and attaches listeners to the station
     */
    public on(listenerMap: CallbackMap, context?: any): Listeners;
    public on(eventNames: string[], callback?: Function, context?: any): Listeners;
    public on(eventName: string, callback?: Function, context?: any): Listeners;
    public on(q: any, r?: any, s?: any): Listeners {

        const stationMeta = this.stationMeta;
        const listeners = makeListeners(this, false, q, r, s);

        for (let listener of listeners) {
            addListener(stationMeta, listener);
        }

        return new Listeners(this, listeners);
    }

    /**
     * Creates and attaches listeners to the station that are applied once and removed
     */
    public once(listenerMap: CallbackMap, context?: any): Listeners;
    public once(eventNames: string[], callback?: Function, context?: any): Listeners;
    public once(eventName: string, callback?: Function, context?: any): Listeners;
    public once(q: any, r?: any, s?: any): Listeners {

        return this.on(q, r, s).occur(1);
    }

    /**
     * Removes listeners from the station that match the given arguments.
     * If no arguments are given, all listeners will be removed;
     * including listeners that were attached via `hear()` or `hearOnce()`.
     */
    public off(): void;
    public off(listenerMap: CallbackMap, context?: any): void;
    public off(eventNames: string[], callback?: Function, context?: any): void;
    public off(eventName: string, callback?: Function, context?: any): void;
    public off(q?: any, r?: any, s?: any): void {

        const stationMeta = this.stationMeta;

        if (stationMeta.listenerCount < 1) return;

        // If no listener targets were given
        if (q === undefined) {
            removeAllListeners(stationMeta);
            return;
        }

        if (
            r === undefined
            && s === undefined
            && typeof q === 'string'
            && (!stationMeta.enableDelimiter || q.indexOf(stationMeta.delimiter) < 0)
        ) {
            removeListeners(q, stationMeta);
            return;
        }

        const listeners = makeListeners(this, true, q, r, s);

        for (let listener of listeners) {
            removeListener(stationMeta, listener);
        }
    }

    /**
     * Creates and attaches listeners to another station.
     * Listeners attached using this method can be removed specifically by using `disregard()`.
     */
    public hear(station: Emitter, listenerMap: CallbackMap, context?: any): Listeners;
    public hear(station: Emitter, eventNames: string[], callback?: Function, context?: any): Listeners;
    public hear(station: Emitter, eventName: string, callback?: Function, context?: any): Listeners;
    public hear(station: Emitter, q: any, r?: any, s?: any): Listeners {

        const heardStations = this.stationMeta.heardStations;
        const listeners = makeListeners(this, false, q, r, s);
        const targetStationMeta = station.stationMeta;

        for (let listener of listeners) {
            listener.hearer = this;
            listener.crossOrigin = station;
            addListener(targetStationMeta, listener);
            heardStations[station.stationId] = station;
        }

        return new Listeners(station, listeners);
    }

    /**
     * Attaches listeners to another station that are applied once and removed
     * Listeners attached using this method can be removed specifically by using `disregard()`.
     */
    public hearOnce(station: Emitter, listenerMap: CallbackMap, context?: any): Listeners;
    public hearOnce(station: Emitter, eventNames: string[], callback?: Function, context?: any): Listeners;
    public hearOnce(station: Emitter, eventName: string, callback?: Function, context?: any): Listeners;
    public hearOnce(station: Emitter, q: any, r?: any, s?: any): Listeners {

        return this.hear(station, q, r, s).occur(1);
    }

    /**
     * Removes listeners from other stations that were attached by the station
     * via `hear()` and `hearOnce()`. If no arguments are given, all listeners
     * that were attached to other stations are removed.
     */
    public disregard(): void;
    public disregard(target: EventStation | EventStation[]): void;
    public disregard(target: EventStation | EventStation[], listenerMap: CallbackMap, context?: any): void;
    public disregard(target: EventStation | EventStation[], eventNames: string[], callback?: Function, context?: any): void;
    public disregard(target: EventStation | EventStation[], eventName: string, callback?: Function, context?: any): void;
    public disregard(target?: any, q?: any, r?: any, s?: any): void {

        const stationMeta = this.stationMeta;

        if (stationMeta.hearingCount < 1) return;

        var isRemovingAll = false;
        var listeners: Listener[] = [];

        // If no listener targets were given
        if (q === undefined) {
            isRemovingAll = true;
        } else {
            listeners = makeListeners(this, true, q, r, s);
        }

        const stations = getTargetedStations(stationMeta, target);

        for (let x = 0, y = stations.length; x < y; x++) {

            let station = stations[x];
            let targetStationMeta = station.stationMeta;

            if (isRemovingAll) {
                q = station.listenerEventNames;
                listeners = makeListeners(this, true, q, r, s);
            }

            for (let listener of listeners) {
                listener.hearer = this;
                removeListener(targetStationMeta, listener);
            }
        }

        if (isRemovingAll) {
            stationMeta.heardStations = Object.create(null);
        } else {
            cleanHeardStations(this);
        }
    }

    /**
     * Determines whether the station has attached listeners that match the
     * given arguments. If no arguments are given, the method determines
     * whether the station has any attached listeners.
     */
    public isHeard(): boolean;
    public isHeard(listenerMap: CallbackMap, context?: any): boolean;
    public isHeard(eventNames: string[], callback?: Function, context?: any): boolean;
    public isHeard(eventName: string, callback?: Function, context?: any): boolean;
    public isHeard(q?: any, r?: any, s?: any): boolean {

        const stationMeta = this.stationMeta;
        const listenerCount = stationMeta.listenerCount;

        if (listenerCount < 1) return false;

        if (arguments.length < 1) {
            // Determine if any listeners are attached
            return listenerCount > 0;
        }

        const listeners = makeListeners(this, true, q, r, s);

        for (let listener of listeners) {
            if (hasListener(stationMeta, listener)) return true;
        }

        return false;
    }

    /**
     * Determines whether other stations have listeners matching the given
     * arguments that were attached by the station via `hear()` and `hearOnce()`.
     * If no arguments are given, the method determines whether other stations
     * have any listeners attached by the station via `hear()` and `hearOnce()`.
     */
    public isHearing(): boolean;
    public isHearing(target: EventStation | EventStation[]): boolean;
    public isHearing(target: EventStation | EventStation[], listenerMap: CallbackMap): boolean;
    public isHearing(target: EventStation | EventStation[], eventNames: string[], callback?: Function): boolean;
    public isHearing(target: EventStation | EventStation[], eventName: string, callback?: Function): boolean;
    public isHearing(target?: any, q?: any, r?: any, s?: any): boolean {

        const stationMeta = this.stationMeta;

        if (stationMeta.hearingCount < 1) return false;

        const stations = getTargetedStations(stationMeta, target);
        var matchAllListeners: boolean = false;

        var listeners: Listener[] = [];

        // If no listener targets were given
        if (q) {
            listeners = makeListeners(this, true, q, r, s);
        } else {
            matchAllListeners = true;
        }

        for (let x = 0, y = stations.length; x < y; x++) {

            let station = stations[x];
            let targetStationMeta = station.stationMeta;

            if (matchAllListeners) {
                q = station.listenerEventNames;
                listeners = makeListeners(this, true, q, r, s);
            }

            for (let listener of listeners) {
                listener.hearer = this;

                if (hasListener(targetStationMeta, listener)) return true;
            }
        }

        return false;
    }

    /**
     * Emits events on the station.
     * Parameters after the first are passed to each listener's callback function.
     */
    public emit(eventNames: string[], ...args: any[]): void;
    public emit(eventName: string, ...args: any[]): void;
    public emit(input: any, ...args: any[]): void {

        const stationMeta = this.stationMeta;

        if (stationMeta.listenerCount < 1) return;

        const eventNames = parseEventNames(input, stationMeta);

        for (let eventName of eventNames) {
            emitEvent(eventName, this, false, args);
        }
    }

    /**
     * Emits events on the station, and then completes asynchronously.
     * Parameters after the first are passed to each listener's callback function.
     * @returns A `Promise` that resolves after all of the return listener promises resolve.
     */
    public emitAsync<R extends any>(eventNames: string[], ...args: any[]): Promise<R[]>;
    public emitAsync<R extends any>(eventName: string, ...args: any[]): Promise<R[]>;
    public emitAsync<R extends any>(input: any, ...args: any[]): Promise<R[]> {

        if (!injection.deps.$Promise) {
            throw new Error('No promises implementation available.');
        }

        const stationMeta = this.stationMeta;

        if (stationMeta.listenerCount < 1) {
            return injection.deps.$Promise.resolve([]);
        }

        const eventNames = parseEventNames(input, stationMeta);

        var promises: Promise<R>[] = [];

        for (let eventName of eventNames) {
            promises = promises.concat(
                emitEvent<Promise<R>>(eventName, this, true, args)
            );
        }

        if (promises.length > 0) {
            return injection.deps.$Promise.all<R>(promises);
        } else {
            return injection.deps.$Promise.resolve([]);
        }
    }

    /**
     * Creates listeners without attaching them to the station
     */
    public makeListeners(listenerMap: CallbackMap, context?: any): Listeners;
    public makeListeners(eventNames: string[], callback?: Function, context?: any): Listeners;
    public makeListeners(eventName: string, callback?: Function, context?: any): Listeners;
    public makeListeners(q: any, r?: any, s?: any): Listeners {

        const listeners = makeListeners(this, false, q, r, s);

        return new Listeners(this, listeners);
    }

    /**
     * @returns Listeners from the station that match the given arguments.
     * If no arguments are given, all listeners will be returned;
     * including listeners that were attached via `hear()` or `hearOnce()`.
     */
    public getListeners(): Listeners;
    public getListeners(listenerMap: CallbackMap, context?: any): Listeners;
    public getListeners(eventNames: string[], callback?: Function, context?: any): Listeners;
    public getListeners(eventName: string, callback?: Function, context?: any): Listeners;
    public getListeners(q?: any, r?: any, s?: any): Listeners | void {

        const attachedListeners = getAllListeners(this.stationMeta);

        if (attachedListeners.length < 1) {
            return undefined;
        }
        if (arguments.length < 1) {
            return new Listeners(this, attachedListeners);
        }

        const matchingListeners = makeListeners(this, true, q, r, s);
        const listeners: Listener[] = [];

        for (let attachedListener of attachedListeners) {
            for (let matchingListener of matchingListeners) {
                if (matchListener(matchingListener, attachedListener)) {
                    listeners.push(attachedListener);
                    break;
                }
            }
        }

        // No matching listeners were found
        if (listeners.length < 1) return undefined;

        return new Listeners(this, listeners);
    }

    /**
     * @returns A new Rx.Observable object from the station
     * This method is dependant on `rx`.
     * @see inject()
     */
    public toObservable<T>(eventNames: string[], context?: any, selector?: (args: any[]) => T): Rx.Observable<T>;
    public toObservable<T>(eventName: string, context?: any, selector?: (args: any[]) => T): Rx.Observable<T>;
    public toObservable<T>(q: any, s?: any, selector?: (args: any[]) => T): Rx.Observable<T> {

        if (!injection.deps.$RxObservable) {
            throw new Error('Rx has not been injected. See documentation for details.');
        }

        return injection.deps.$RxObservable.fromEventPattern<T>((r) => {
            this.on(q, r, s);
        }, (r) => {
            this.off(q, r, s);
        }, selector);
    }

    /**
     * Stops the propagation of an emitted event. When called, this method effectively does
     * nothing if an event is not being emitted at the time.
     */
    public stopPropagation(): void {
        this.stationMeta.isPropagationStopped = true;
    }

    /**
     * Adds the given listener to the station
     */
    public addListener(listener: Listener): void {
        addListener(this.stationMeta, listener);
    }

    /**
    * Removes all listeners that match the given listener from the station
    * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
    */
    public removeListener(listener: Listener, exactMatch?: boolean): void {
        removeListener(this.stationMeta, listener, exactMatch);
    }

    /**
    * Determines whether any listener attached to the station matches the given listener.
    * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
    */
    public hasListener(listener: Listener, exactMatch?: boolean): boolean {
        return hasListener(this.stationMeta, listener, exactMatch);
    }

    /** Initializes the given object */
    public static init(obj: any, options?: options.Options): typeof EventStation {
        obj.stationMeta = makeStationMeta(options);

        return EventStation;
    }

    public static inject(name: string, obj: any): typeof EventStation {
        injection.inject(name, obj);

        return EventStation;
    }

    /** Modifies the global configuration */
    public static config(opts: options.Options): typeof EventStation {
        options.config(opts);

        return EventStation;
    }

    /** Resets the global configuration and injected dependencies */
    public static reset(): typeof EventStation {
        options.reset();
        injection.reset();

        return EventStation;
    }

    /**
     * Extends an object with EventStation's public members
     */
    public static extend<T extends Emitter>(obj: any): T {
        const proto = EventStation.prototype;

        for (let propertyName in proto) {

            const descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
            const newDescriptor: PropertyDescriptor = { configurable: true };

            if (descriptor.get !== undefined) {
                newDescriptor.get = descriptor.get;
            } else {
                newDescriptor.value = descriptor.value;
            }

            Object.defineProperty(obj, propertyName, newDescriptor);
        }

        return obj;
    }

    public static make(): Emitter {
        var station = EventStation.extend({});

        EventStation.init(station);

        return station;
    }
}

function parseEventNames(eventNames: string[], options: Meta): string[];
function parseEventNames(eventName: string, options: Meta): string[];
function parseEventNames(input: any, options: Meta): string[] {
    var names: string[];

    if (typeof input === 'string') {

        const delimiter = options.delimiter;

        if (options.enableDelimiter && delimiter) {
            names = input.split(delimiter);
        } else {
            names = [input];
        }

    } else if (Array.isArray(input)) {
        names = input;
    } else {
        throw new Error("Invalid first argument");
    }

    return names;
}

/** Creates a new station meta object from the given configuration options */
function makeStationMeta(config: options.Options = {}): Meta {
    const state = {
        heardStations: Object.create(null),
        hearingCount: 0,
        isPropagationStopped: false,
        listenerCount: 0,
        listenersMap: Object.create(null),
        stationId: makeStationId(),
    };

    const meta = options.mergeOptions<Meta>(state, options.globalOptions, config);

    options.assertOptions(meta);

    return meta;
}

/**
 * Makes an array of listeners from the given parameters
 * This function normalizes the four ways to make listeners.
 */
function makeListeners(originStation: Emitter, isMatching: boolean, listenerMap: CallbackMap, context?: EventStation): Listener[];
function makeListeners(originStation: Emitter, isMatching: boolean, eventNames: string[], callback?: Function, context?: EventStation): Listener[];
function makeListeners(originStation: Emitter, isMatching: boolean, eventName: string, callback?: Function, context?: EventStation): Listener[];
function makeListeners(originStation: Emitter, isMatching: boolean, q: any, r?: any, s?: any): Listener[] {

    if (typeof q === 'string') {

        const stationMeta = originStation.stationMeta;
        const enableDelimiter = stationMeta.enableDelimiter;
        const delimiter = stationMeta.delimiter;

        if (enableDelimiter && q.indexOf(delimiter) >= 0) {
            q = (<string>q).split(delimiter);
            return makeListenersFromArray(originStation, isMatching, q, r, s);
        }

        return [{
            eventName: q,
            callback: r,
            context: !isMatching && s === undefined ? originStation : s,
            matchCallback: r,
            matchContext: s,
        }];
    }

    if (Array.isArray(q)) {
        return makeListenersFromArray(originStation, isMatching, q, r, s);
    }

    if (typeof q === 'object') {
        return makeListenersFromMap(originStation, isMatching, q, r);
    }

    throw new Error("Invalid arguments");
}


/** Makes an array of listeners from the given listener map */
function makeListenersFromMap(originStation: Emitter, isMatching: boolean, listenerMap: CallbackMap, context: any): Listener[] {

    const listeners: Listener[] = [];

    for (let eventName in listenerMap) {

        listeners.push({
            eventName: eventName,
            callback: listenerMap[eventName],
            context: !isMatching && context === undefined ? originStation : context,
            matchCallback: listenerMap[eventName],
            matchContext: context,
        });
    }

    return listeners;
}

/** Makes an array of listeners from the given event name array */
function makeListenersFromArray(originStation: Emitter, isMatching: boolean, eventNames: string[], callback: Function, context: any): Listener[] {

    const listeners: Listener[] = [];

    for (let i = 0, l = eventNames.length; i < l; i++) {

        listeners.push({
            eventName: eventNames[i],
            callback: callback,
            context: !isMatching && context === undefined ? originStation : context,
            matchContext: context,
            matchCallback: callback,
        });
    }

    return listeners;
}

function emitEvent<P extends Promise<any>>(eventName: string, originStation: Emitter, enableAsync: boolean, args: any[]): P[] {

    const stationMeta = originStation.stationMeta;
    const listenersMap = stationMeta.listenersMap;

    var listeners: Listener[];

    if (stationMeta.enableRegExp) {
        listeners = searchListeners(eventName, listenersMap, stationMeta.regExpMarker);
    } else {
        listeners = listenersMap[eventName];
    }

    var promises: P[] = [];

    if (listeners) {

        let result = applyListeners<P>(listeners, originStation, enableAsync, args);

        if (enableAsync && result) {
            promises = promises.concat(result);
        }
    }

    const listenersMapAll = listenersMap['all'];

    if (stationMeta.emitAllEvent && listenersMapAll) {

        let argsAll = args.slice();

        argsAll.splice(0, 0, eventName);

        let result = applyListeners<P>(listenersMapAll, originStation, enableAsync, argsAll);

        if (enableAsync && result) {
            promises = promises.concat(result);
        }
    }

    return promises;
}

/**
 * Retrieves listeners from the given listener map
 * that match the given event name. Specifically,
 * this function recognizes regular expression listeners.
 */
function searchListeners(eventName: string, listenersMap: ListenersMap, regExpMarker: string): Listener[] {

    var listeners: Listener[] = [];

    for (let expression in listenersMap) {

        if (expression.indexOf(regExpMarker) === 0) {

            if (new RegExp(expression.substr(regExpMarker.length)).test(eventName)) {
                listeners = listeners.concat(listenersMap[expression]);
            }

        } else if (expression === eventName) {

            listeners = listeners.concat(listenersMap[eventName]);
        }
    }

    return listeners;
}

/** Clean the `heardStations` property of the meta of the given station */
function cleanHeardStations(station: EventStation): void {

    const stationMap: StationMap = Object.create(null);
    const heardStations = station.stationMeta.heardStations;

    for (let stationId in heardStations) {

        const heardStation = heardStations[stationId];

        if (hasListener(heardStation.stationMeta, { hearer: station })) {
            stationMap[stationId] = heardStation;
        }
    }

    station.stationMeta.heardStations = stationMap;
}

/** Removes all listeners from then given station meta */
function removeAllListeners(stationMeta: Meta): void {

    const listenersMap = stationMeta.listenersMap;

    for (let eventName in listenersMap) {

        const listeners = listenersMap[eventName];

        for (let listener of listeners) {
            const hearer = listener.hearer;

            if (hearer) {
                hearer.stationMeta.hearingCount--;
            }
        }
    }

    stationMeta.listenerCount = 0;
    stationMeta.listenersMap = Object.create(null);
}

/** Removes all listeners for a particular event from the given station meta */
function removeListeners(eventName: string, stationMeta: Meta): void {

    const listenersMap = stationMeta.listenersMap;
    const listeners = listenersMap[eventName];

    if (listeners === undefined) return;

    const count = listeners.length;

    for (let i = 0; i < count; i++) {

        const listener = listeners[i];
        const hearer = listener.hearer;

        if (hearer) {
            hearer.stationMeta.hearingCount--;
        }
    }

    stationMeta.listenerCount = stationMeta.listenerCount - count;
    delete listenersMap[eventName];
}

/**
 * Retrieves the targeted stations from the given parameters
 * This function normalizes the the target station for
 * cross-emitter listening methods.
 */
function getTargetedStations(stationMeta: Meta, target?: EventStation | EventStation[]): EventStation[] {

    if (target === undefined) {
        return getHeardStations(stationMeta);
    }

    if (Array.isArray(target)) {
        return <EventStation[]>target;
    }

    if ((<EventStation>target).stationMeta) {
        return [<EventStation>target];
    }

    throw new Error("Invalid target");
}

/**
 * @returns the heard stations of a given station's meta as an array
 */
function getHeardStations(stationMeta: Meta): EventStation[] {

    const stations: EventStation[] = [];
    const heardStations = stationMeta.heardStations;

    for (let stationId in heardStations) {
        stations.push(heardStations[stationId]);
    }

    return stations;
}

/**
 * A literal object with non-delimited event names
 * as keys and callback functions as values.
 */
export interface CallbackMap {
    [eventName: string]: Function;
}
