import { addListener } from '../actions/addListener';
import { applyListeners } from '../actions/applyListeners';
import { Emitter } from '../types/Emitter';
import { getAllListeners } from '../actions/getAllListeners';
import { hasListener } from '../actions/hasListener';
import { Listener } from '../types/Listener';
import { Listeners } from './Listeners';
import { ListenersMap } from '../types/ListenersMap';
import { makeStationId } from '../actions/makeStationId';
import { matchListener } from '../actions/matchListener';
import { Meta } from '../types/Meta';
import { Options } from '../types/Options';
import { removeListener } from '../actions/removeListener';
import { Rx } from '../types/Rx';
import { StationMap } from '../types/StationMap';
import * as config from '../config';
import * as injector from '../injector';

/**
 * Event emitter class and namespace
 */
export class EventStation {

    /** Container for the station's context */
    public stationMeta: Meta;

    constructor(options?: Options) {
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

        for (const listener of listeners) {
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

        for (const listener of listeners) {
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

        for (const listener of listeners) {
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
    public disregard(target: Emitter | Emitter[]): void;
    public disregard(target: Emitter | Emitter[], listenerMap: CallbackMap, context?: any): void;
    public disregard(target: Emitter | Emitter[], eventNames: string[], callback?: Function, context?: any): void;
    public disregard(target: Emitter | Emitter[], eventName: string, callback?: Function, context?: any): void;
    public disregard(target?: any, q?: any, r?: any, s?: any): void {

        const stationMeta = this.stationMeta;

        if (stationMeta.hearingCount < 1) return;

        let isRemovingAll = false;
        let listeners: Listener[] = [];

        // If no listener targets were given
        if (q === undefined) {
            isRemovingAll = true;
        } else {
            listeners = makeListeners(this, true, q, r, s);
        }

        const stations = getTargetedStations(stationMeta, target);
        const count = stations.length;

        for (let x = 0; x < count; x++) {

            const station = stations[x];
            const targetStationMeta = station.stationMeta;

            if (isRemovingAll) {
                q = station.listenerEventNames;
                listeners = makeListeners(this, true, q, r, s);
            }

            for (const listener of listeners) {
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

        for (const listener of listeners) {
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
    public isHearing(target: Emitter | Emitter[]): boolean;
    public isHearing(target: Emitter | Emitter[], listenerMap: CallbackMap): boolean;
    public isHearing(target: Emitter | Emitter[], eventNames: string[], callback?: Function): boolean;
    public isHearing(target: Emitter | Emitter[], eventName: string, callback?: Function): boolean;
    public isHearing(target?: any, q?: any, r?: any, s?: any): boolean {

        const stationMeta = this.stationMeta;

        if (stationMeta.hearingCount < 1) return false;

        const stations = getTargetedStations(stationMeta, target);
        let matchAllListeners: boolean = false;
        let listeners: Listener[] = [];

        // If no listener targets were given
        if (q) {
            listeners = makeListeners(this, true, q, r, s);
        } else {
            matchAllListeners = true;
        }

        const count = stations.length;

        for (let x = 0; x < count; x++) {
            const station = stations[x];
            const targetStationMeta = station.stationMeta;

            if (matchAllListeners) {
                q = station.listenerEventNames;
                listeners = makeListeners(this, true, q, r, s);
            }

            for (const listener of listeners) {
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

        for (const eventName of eventNames) {
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

        if (!injector.deps.$Promise) {
            throw new Error(`No promises implementation available.`);
        }

        const stationMeta = this.stationMeta;

        if (stationMeta.listenerCount < 1) {
            return injector.deps.$Promise.resolve([]);
        }

        const eventNames = parseEventNames(input, stationMeta);

        let promises: Promise<R>[] = [];

        for (const eventName of eventNames) {
            promises = promises.concat(
                emitEvent<Promise<R>>(eventName, this, true, args)
            );
        }

        if (promises.length > 0) {
            return injector.deps.$Promise.all<R>(promises);
        } else {
            return injector.deps.$Promise.resolve([]);
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

        for (const attachedListener of attachedListeners) {
            for (const matchingListener of matchingListeners) {
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
    public toObservable<T>(eventNames: string[], context?: any, selector?: (args: any[]) => T): Rx.Observable;
    public toObservable<T>(eventName: string, context?: any, selector?: (args: any[]) => T): Rx.Observable;
    public toObservable<T>(q: any, s?: any, selector?: (args: any[]) => T): Rx.Observable {

        if (!injector.deps.$RxObservable) {
            throw new Error(`Rx has not been injected. See documentation for details.`);
        }

        const addHandler = (r: Function) => {
            this.on(q, r, s);
        };

        const removeHandler = (r: Function) => {
            this.off(q, r, s);
        };

        return injector.deps.$RxObservable.fromEventPattern<T>(addHandler, removeHandler, selector);
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
    public static init(obj: any, options?: Options): typeof EventStation {
        obj.stationMeta = makeStationMeta(options);

        return EventStation;
    }

    public static inject(name: string, obj: any): typeof EventStation {
        injector.inject(name, obj);

        return EventStation;
    }

    /** Modifies the global configuration */
    public static config(opts: Options): typeof EventStation {
        config.config(opts);

        return EventStation;
    }

    /** Resets the global configuration and injected dependencies */
    public static reset(): typeof EventStation {
        config.reset();
        injector.reset();

        return EventStation;
    }

    /**
     * Extends an object with EventStation's public members
     */
    public static extend<T extends Emitter>(obj: any): T {
        const proto = EventStation.prototype;
        const properties = Object.keys(proto);

        for (const property of properties) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, property);
            const newDescriptor: PropertyDescriptor = { configurable: true };

            if (descriptor.get !== undefined) {
                newDescriptor.get = descriptor.get;
            } else {
                newDescriptor.value = descriptor.value;
            }

            Object.defineProperty(obj, property, newDescriptor);
        }

        return obj;
    }

    public static make(): Emitter {
        const station = EventStation.extend({});

        EventStation.init(station);

        return station;
    }
}

function parseEventNames(eventNames: string[], options: Meta): string[];
function parseEventNames(eventName: string, options: Meta): string[];
function parseEventNames(input: any, options: Meta): string[] {
    let names: string[];

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
        throw new Error(`Invalid first argument`);
    }

    return names;
}

/** Creates a new station meta object from the given configuration options */
function makeStationMeta(options: Options = {}): Meta {
    const state = {
        heardStations: Object.create(null),
        hearingCount: 0,
        isPropagationStopped: false,
        listenerCount: 0,
        listenersMap: Object.create(null),
        stationId: makeStationId(),
    };

    const meta = config.mergeOptions<Meta>(state, config.globalOptions, options);

    config.assertOptions(meta);

    return meta;
}

/**
 * Makes an array of listeners from the given parameters
 * This function normalizes the four ways to make listeners.
 */
function makeListeners(origin: Emitter, isMatching: boolean, listenerMap: CallbackMap, context?: Emitter): Listener[];
function makeListeners(origin: Emitter, isMatching: boolean, eventNames: string[], callback?: Function, context?: Emitter): Listener[];
function makeListeners(origin: Emitter, isMatching: boolean, eventName: string, callback?: Function, context?: Emitter): Listener[];
function makeListeners(origin: Emitter, isMatching: boolean, q: any, r?: any, s?: any): Listener[] {

    if (typeof q === 'string') {

        const stationMeta = origin.stationMeta;
        const enableDelimiter = stationMeta.enableDelimiter;
        const delimiter = stationMeta.delimiter;

        if (enableDelimiter && q.indexOf(delimiter) >= 0) {
            q = (<string>q).split(delimiter);
            return makeListenersFromArray(origin, isMatching, q, r, s);
        }

        return [{
            eventName: q,
            callback: r,
            context: !isMatching && s === undefined ? origin : s,
            matchCallback: r,
            matchContext: s,
        }];
    }

    if (Array.isArray(q)) {
        return makeListenersFromArray(origin, isMatching, q, r, s);
    }

    if (typeof q === 'object') {
        return makeListenersFromMap(origin, isMatching, q, r);
    }

    throw new Error(`Invalid arguments`);
}

/** Makes an array of listeners from the given listener map */
function makeListenersFromMap(originStation: Emitter, isMatching: boolean, listenerMap: CallbackMap, context: any): Listener[] {

    const listeners: Listener[] = [];

    // `listenersMap` has no prototype
    // tslint:disable-next-line:no-for-in forin
    for (const eventName in listenerMap) {

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
function makeListenersFromArray(origin: Emitter, isMatching: boolean, eventNames: string[], callback: Function, context: any): Listener[] {

    const listeners: Listener[] = [];
    const count = eventNames.length;

    for (let i = 0; i < count; i++) {

        listeners.push({
            eventName: eventNames[i],
            callback: callback,
            context: !isMatching && context === undefined ? origin : context,
            matchContext: context,
            matchCallback: callback,
        });
    }

    return listeners;
}

function emitEvent<P extends Promise<any>>(eventName: string, originStation: Emitter, enableAsync: boolean, args: any[]): P[] {

    const stationMeta = originStation.stationMeta;
    const listenersMap = stationMeta.listenersMap;

    let listeners: Listener[] | void;

    if (stationMeta.enableRegExp) {
        listeners = searchListeners(eventName, listenersMap, stationMeta.regExpMarker);
    } else {
        listeners = listenersMap[eventName];
    }

    let promises: P[] = [];

    if (listeners) {

        const result = applyListeners<P>(listeners, originStation, enableAsync, args);

        if (enableAsync && result) {
            promises = promises.concat(result);
        }
    }

    const listenersMapAll: Listener[] | void = listenersMap[config.allEvent];

    if (stationMeta.emitAllEvent && listenersMapAll) {

        const argsAll = args.slice();

        argsAll.splice(0, 0, eventName);

        const result = applyListeners<P>(listenersMapAll, originStation, enableAsync, argsAll);

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

    let listeners: Listener[] = [];

    // `listenersMap` has no prototype
    // tslint:disable-next-line:no-for-in forin
    for (const expression in listenersMap) {

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
function cleanHeardStations(station: Emitter): void {

    const stationMap: StationMap = Object.create(null);
    const heardStations = station.stationMeta.heardStations;

    // `heardStations` has no prototype
    // tslint:disable-next-line:no-for-in forin
    for (const stationId in heardStations) {

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

    // `listenersMap` has no prototype
    // tslint:disable-next-line:no-for-in forin
    for (const eventName in listenersMap) {

        const listeners = listenersMap[eventName];

        for (const listener of listeners) {
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
function getTargetedStations(stationMeta: Meta, target?: Emitter | Emitter[]): Emitter[] {

    if (target === undefined) {
        return getHeardStations(stationMeta);
    }

    if (Array.isArray(target)) {
        return target;
    }

    if (target.stationMeta) {
        return [target];
    }

    throw new Error(`Invalid target`);
}

/**
 * @returns the heard stations of a given station's meta as an array
 */
function getHeardStations(stationMeta: Meta): Emitter[] {

    const stations: Emitter[] = [];
    const heardStations = stationMeta.heardStations;

    // `heardStations` has no prototype
    // tslint:disable-next-line:no-for-in forin
    for (const stationId in heardStations) {
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
