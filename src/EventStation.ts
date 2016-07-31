/*
 * Event-Station
 *
 * Copyright (c) 2015 Morris Allison III <author@morris.xyz> (http://morris.xyz)
 * Released under the MIT License.
 *
 * For the full copyright and license information, please view
 * the LICENSE file distributed with this source code.
 *
 * @preserve
 */

/**
 * Event emitter class and namespace
 */
class EventStation {

    /** Container for the station's context */
    public stationMeta: EventStation.Meta;

    constructor(options?: EventStation.Options) {
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
    public on(listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    public on(eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    public on(eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    public on(q: any, r?: any, s?: any): EventStation.Listeners {

        const stationMeta = this.stationMeta;
        const listeners = makeListeners(this, false, q, r, s);

        for (let i = 0, c = listeners.length; i < c; i++) {
            addListener(stationMeta, listeners[i]);
        }

        return new EventStation.Listeners(this, listeners);
    }

    /**
     * Creates and attaches listeners to the station that are applied once and removed
     */
    public once(listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    public once(eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    public once(eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    public once(q: any, r?: any, s?: any): EventStation.Listeners {

        return this.on(q, r, s).occur(1);
    }

    /**
     * Removes listeners from the station that match the given arguments.
     * If no arguments are given, all listeners will be removed;
     * including listeners that were attached via `hear()` or `hearOnce()`.
     */
    public off(): void;
    public off(listenerMap: EventStation.CallbackMap, context?: any): void;
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
            && ( ! stationMeta.enableDelimiter || q.indexOf(stationMeta.delimiter) < 0)
        ) {
            removeListeners(q, stationMeta);
            return;
        }

        const listeners = makeListeners(this, true, q, r, s);

        for (let i = 0, c = listeners.length; i < c; i++) {
            removeListener(stationMeta, listeners[i]);
        }
    }

    /**
     * Creates and attaches listeners to another station.
     * Listeners attached using this method can be removed specifically by using `disregard()`.
     */
    public hear(station: EventStation.Emitter, listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    public hear(station: EventStation.Emitter, eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    public hear(station: EventStation.Emitter, eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    public hear(station: EventStation.Emitter, q: any, r?: any, s?: any): EventStation.Listeners {

        const heardStations = this.stationMeta.heardStations;
        const listeners = makeListeners(this, false, q, r, s);
        const targetStationMeta = station.stationMeta;

        for (let i = 0, c = listeners.length; i < c; i++) {
            const listener = listeners[i];
            listener.hearer = this;
            listener.crossOrigin = station;
            addListener(targetStationMeta, listener);
            heardStations[station.stationId] = station;
        }

        return new EventStation.Listeners(station, listeners);
    }

    /**
     * Attaches listeners to another station that are applied once and removed
     * Listeners attached using this method can be removed specifically by using `disregard()`.
     */
    public hearOnce(station: EventStation.Emitter, listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    public hearOnce(station: EventStation.Emitter, eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    public hearOnce(station: EventStation.Emitter, eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    public hearOnce(station: EventStation.Emitter, q: any, r?: any, s?: any): EventStation.Listeners {

        return this.hear(station, q, r, s).occur(1);
    }

    /**
     * Removes listeners from other stations that were attached by the station
     * via `hear()` and `hearOnce()`. If no arguments are given, all listeners
     * that were attached to other stations are removed.
     */
    public disregard(): void;
    public disregard(target: EventStation | EventStation[]): void;
    public disregard(target: EventStation | EventStation[], listenerMap: EventStation.CallbackMap, context?: any): void;
    public disregard(target: EventStation | EventStation[], eventNames: string[], callback?: Function, context?: any): void;
    public disregard(target: EventStation | EventStation[], eventName: string, callback?: Function, context?: any): void;
    public disregard(target?: any, q?: any, r?: any, s?: any): void {

        const stationMeta = this.stationMeta;

        if (stationMeta.hearingCount < 1) return;

        var isRemovingAll = false;
        var listeners: EventStation.Listener[];

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

            for (let i = 0, c = listeners.length; i < c; i++) {
                const listener = listeners[i];
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
    public isHeard(listenerMap: EventStation.CallbackMap, context?: any): boolean;
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

        for (let i = 0, c = listeners.length; i < c; i++) {
            if (hasListener(stationMeta, listeners[i])) return true;
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
    public isHearing(target: EventStation | EventStation[], listenerMap: EventStation.CallbackMap): boolean;
    public isHearing(target: EventStation | EventStation[], eventNames: string[], callback?: Function): boolean;
    public isHearing(target: EventStation | EventStation[], eventName: string, callback?: Function): boolean;
    public isHearing(target?: any, q?: any, r?: any, s?: any): boolean {

        const stationMeta = this.stationMeta;

        if (stationMeta.hearingCount < 1) return false;

        const stations = getTargetedStations(stationMeta, target);
        var matchAllListeners: boolean = false;

        var listeners: EventStation.Listener[];

        // If no listener targets were given
        if (q === undefined) {
            matchAllListeners = true;
        } else {
            listeners = makeListeners(this, true, q, r, s);
        }

        for (let x = 0, y = stations.length; x < y; x++) {

            let station = stations[x];
            let targetStationMeta = station.stationMeta;

            if (matchAllListeners) {
                q = station.listenerEventNames;
                listeners = makeListeners(this, true, q, r, s);
            }

            for (let i = 0, c = listeners.length; i < c; i++) {

                const listener = listeners[i];
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

        for (let i = 0, c = eventNames.length; i < c; i++) {
            emitEvent(eventNames[i], this, false, args);
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

        if ($Promise === undefined) {
            throw new Error('No promises implementation available.');
        }

        const stationMeta = this.stationMeta;

        if (stationMeta.listenerCount < 1) {
            return $Promise.resolve();
        }

        const eventNames = parseEventNames(input, stationMeta);

        var promises: Promise<R>[] = [];

        for (let i = 0, c = eventNames.length; i < c; i++) {
            promises = promises.concat(
                emitEvent<Promise<R>>(eventNames[i], this, true, args)
            );
        }

        if (promises.length > 0) {
            return $Promise.all<R>(promises);
        } else {
            return $Promise.resolve();
        }
    }

    /**
     * Creates listeners without attaching them to the station
     */
    public makeListeners(listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    public makeListeners(eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    public makeListeners(eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    public makeListeners(q: any, r?: any, s?: any): EventStation.Listeners {

        const listeners = makeListeners(this, false, q, r, s);

        return new EventStation.Listeners(this, listeners);
    }

    /**
     * @returns Listeners from the station that match the given arguments.
     * If no arguments are given, all listeners will be returned;
     * including listeners that were attached via `hear()` or `hearOnce()`.
     */
    public getListeners(): EventStation.Listeners;
    public getListeners(listenerMap: EventStation.CallbackMap, context?: any): EventStation.Listeners;
    public getListeners(eventNames: string[], callback?: Function, context?: any): EventStation.Listeners;
    public getListeners(eventName: string, callback?: Function, context?: any): EventStation.Listeners;
    public getListeners(q?: any, r?: any, s?: any): EventStation.Listeners {

        const attachedListeners = getAllListeners(this.stationMeta);
        const attachedCount = attachedListeners.length;

        if (attachedCount < 1) {
            return undefined;
        }
        if (arguments.length < 1) {
            return new EventStation.Listeners(this, attachedListeners);
        }

        const matchingListeners = makeListeners(this, true, q, r, s);
        const listeners: EventStation.Listener[] = [];

        for (let i = 0; i < attachedCount; i++) {

            let attachedListener = attachedListeners[i];

            for (let i = 0, c = matchingListeners.length; i < c; i++) {

                let matchingListener = matchingListeners[i];

                if (matchListener(matchingListener, attachedListener)) {
                    listeners.push(attachedListener);
                    break;
                }
            }
        }

        // No matching listeners were found
        if (listeners.length < 1) return undefined;

        return new EventStation.Listeners(this, listeners);
    }

    /**
     * @returns A new Rx.Observable object from the station
     * This method is dependant on `rx`.
     * @see EventStation.inject()
     */
    public toObservable<T>(eventNames: string[], context?: any, selector?: (args: any[]) => T): Rx.Observable<T>;
    public toObservable<T>(eventName: string, context?: any, selector?: (args: any[]) => T): Rx.Observable<T>;
    public toObservable<T>(q: any, s?: any, selector?: (args: any[]) => T): Rx.Observable<T> {

        if ($RxObservable === undefined) {
            throw new Error('Rx has not been injected. See documentation for details.');
        }

        return $RxObservable.fromEventPattern<T>((r) => {
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
    public addListener(listener: EventStation.Listener): void {
        addListener(this.stationMeta, listener);
    }

    /**
    * Removes all listeners that match the given listener from the station
    * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
    */
    public removeListener(listener: EventStation.Listener, exactMatch?: boolean): void {
        removeListener(this.stationMeta, listener, exactMatch);
    }

    /**
    * Determines whether any listener attached to the station matches the given listener.
    * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
    */
    public hasListener(listener: EventStation.Listener, exactMatch?: boolean): boolean {
        return hasListener(this.stationMeta, listener, exactMatch);
    }
}

namespace EventStation {

    /** Initializes the given object */
    export function init(obj: any, options?: Options) {
        obj.stationMeta = makeStationMeta(options);
    }

    /** Changes the default global configuration */
    export function config(options: Options): typeof EventStation {

        for (let optionName in globalOptions) {
            globalOptions[optionName] = options[optionName];
        }

        return EventStation;
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
    export function inject(name: 'rx', rx: any): typeof EventStation;
    export function inject(name: 'Promise', Promise: any): typeof EventStation;
    export function inject(name: string, obj: any): typeof EventStation;
    export function inject(name: string, obj: any): typeof EventStation {

        if (name === 'rx') {
            $RxObservable = obj.Observable;
        } else if (name === 'Promise') {
            $Promise = obj;
        } else {
            throw new Error('Invalid name');
        }

        return EventStation;
    }

    /**
     * Extends an object with EventStation's public members
     */
    export function extend(obj: any): any {

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

    /**
     * A class for operations targeting a collection of listeners
     */
    export class Listeners {

        /** @returns The number of listeners in the collection */
        public get count(): number {
            return this.listeners.length;
        }

        /** The station which the listeners originate from */
        private originStation: Emitter;

        /** An array of listeners */
        private listeners: Listener[];

        constructor(originStation: Emitter, listeners: Listener[]) {
            this.originStation = originStation;
            this.listeners = listeners;
        }

        /**
         * Sets each listener's maximum occurrence
         */
        public occur(maxOccurrences: number): Listeners {

            if (maxOccurrences < 1) {
                throw new Error("The maximum occurrences must be greater than or equal to one.");
            }

            const listeners = this.listeners;

            for (let i = 0, c = listeners.length; i < c; i++) {
                listeners[i].maxOccurrences = maxOccurrences;
            }

            return this;
        }

        /**
         * Sets each listener's callback function
         */
        public calling(callback: Function): Listeners {

            const listeners = this.listeners;

            for (var i = 0, c = listeners.length; i < c; i++) {
                const listener = listeners[i];
                listener.callback = callback;
                listener.matchCallback = callback;
            }

            return this;
        }

        /**
         * Sets each listener's callback function, and maximum occurrence to one(1)
         */
        public once(callback: Function): Listeners {

            return this.calling(callback).occur(1);
        }

        /**
         * Removes the listeners from all stations
         */
        public off(): Listeners {

            const listeners = this.listeners;

            for (var i = 0, c = listeners.length; i < c; i++) {
                removeListenerFromAll(listeners[i]);
            }

            return this;
        }

        /**
         * Sets the context of each listener
         */
        public using(context: any): Listeners {

            const listeners = this.listeners;

            for (var i = 0, c = listeners.length; i < c; i++) {
                const listener = listeners[i];
                listener.context = context;
                listener.matchContext = context;
            }

            return this;
        }

        /**
         * Adds each listener to the given station
         */
        public addTo(station: EventStation): Listeners {

            const listeners = this.listeners;
            const stationMeta = station.stationMeta;

            for (var i = 0, c = listeners.length; i < c; i++) {

                const listener = listeners[i];
                const crossOrigin = listener.crossOrigin;

                if (crossOrigin !== undefined && crossOrigin !== station) {
                    throw new Error("Cross-emitter listeners can only be attached to their origin station.");
                }

                addListener(stationMeta, listener);
            }

            return this;
        }

        /**
         * Removes each listener from the given station
         */
        public removeFrom(station: EventStation): Listeners {

            const listeners = this.listeners;
            const stationMeta = station.stationMeta;

            for (var i = 0, c = listeners.length; i < c; i++) {
                removeListener(stationMeta, listeners[i], true);
            }

            return this;
        }

        /**
         * Moves the listeners to another station.
         * This method changes the origin station.
         */
        public moveTo(station: Emitter): Listeners {

            this.removeFrom(this.originStation);
            this.originStation = station;
            this.addTo(station);

            return this;
        }

        /**
         * Determines whether any listener in the collection matches the given listener.
         * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
         */
        public has(matchingListener: MatchListener, exactMatch?: boolean): boolean {
            return matchListeners(matchingListener, this.listeners, exactMatch);
        }

        /**
         * Adds the listeners to the origin station
         */
        public attach(): Listeners {
            return this.addTo(this.originStation);
        }

        /**
         * Removes the listeners from the origin station
         */
        public detach(): Listeners {
            return this.removeFrom(this.originStation);
        }

        /**
         * Determines whether any of the listeners are attached to the given station.
         * If no station is given, the method determines whether any of the listeners
         * are attached to *any* station.
         */
        public isAttachedTo(station?: EventStation): boolean {

            if (station === undefined) {
                return isListenersAttached(this.listeners);
            }

            return hasListeners(station.stationMeta, this.listeners, true);
        }

        /**
         * Determines whether any of the listeners are attached to the origin station
         */
        public isAttached(): boolean {
            return this.isAttachedTo(this.originStation);
        }

        /**
         * Pauses each listener
         */
        public pause(): Listeners {

            const listeners = this.listeners;

            for (var i = 0, c = listeners.length; i < c; i++) {
                listeners[i].isPaused = true;
            }

            return this;
        }

        /**
         * Un-pauses each listener
         */
        public resume(): Listeners {

            const listeners = this.listeners;

            for (var i = 0, c = listeners.length; i < c; i++) {
                listeners[i].isPaused = false;
            }

            return this;
        }

        /**
         * Determines whether any of listeners are paused
         */
        public isPaused(): boolean {

            const listeners = this.listeners;

            for (var i = 0, c = listeners.length; i < c; i++) {
                if (listeners[i].isPaused) return true;
            }

            return false;
        }

        /**
         * @returns An iterable object (array) containing a promise
         * for each listener that resolves when said listener is applied.
         * This method is dependant on `Promise`.
         * @see EventStation.inject()
         */
        public toPromises(): Array<Promise<Listener>> {

            const promises: Array<Promise<Listener>> = [];
            const listeners = this.listeners;

            for (let i = 0, c = listeners.length; i < c; i++) {
                promises[i] = makePromise(listeners[i]);
            }

            return promises;
        }

        /**
         * @returns A promise that resolves when all of the listeners
         * have been applied at least once.
         * This method is dependant on `Promise`.
         * @see EventStation.inject()
         */
        public all(): Promise<Listener[]> {

            return $Promise.all<Listener>(this.toPromises());
        }

        /**
         * @returns A promise that resolves when one of the listeners is applied.
         * This method is dependant on `Promise`.
         * @see EventStation.inject()
         */
        public race(): Promise<Listener> {

            return $Promise.race<Listener>(this.toPromises());
        }

        /**
         * Un-pauses each listener, and resets each listener's occurrence count
         */
        public reset(): Listeners {

            const listeners = this.listeners;

            for (let i = 0, c = listeners.length; i < c; i++) {
                const listener = listeners[i];
                listener.occurrences = undefined;
                listener.isPaused = undefined;
            }

            return this;
        }

        /** Similar to Array.prototype.forEach() */
        public forEach(func: EventStation.ForEachCallback): Listeners {

            const listeners = this.listeners;

            for (let i = 0, c = listeners.length; i < c; i++) {
                func(listeners[i], i, listeners);
            }

            return this;
        }

        /** Retrieves a listener located at the given index */
        public get(index: number): Listener {
            return this.listeners[index];
        }

        /** Retrieves the index of the given listener */
        public index(listener: Listener): number {

            const listeners = this.listeners;

            for (let i = 0, c = listeners.length; i < c; i++) {
                if (listeners[i] === listener) return i;
            }

            return undefined;
        }

        /**
         * @returns A new `Listeners` object containing a clone of each Listener
         * The new object will not have an `originStation`.
         */
        public clone(): Listeners {

            const clonedListeners: Listener[] = [];
            const listeners = this.listeners;

            for (let i = 0, c = listeners.length; i < c; i++) {
                clonedListeners[i] = cloneListener(listeners[i]);
            }

            return new Listeners(this.originStation, clonedListeners);
        }
    }
}

/** Iterator for generating unique station IDs */
var stationIdIterator: number = 0;

/** Container for global configuration options */
var globalOptions: EventStation.Options = Object.create(null);

/*
 * Global configuration defaults
 */
globalOptions.emitAllEvent = true;
globalOptions.enableRegExp = false;
globalOptions.regExpMarker = '%';
globalOptions.enableDelimiter = true;
globalOptions.delimiter = ' ';

/**
 * A reference to the injected Rx namespace.
 * @see EventStation.inject()
 */
var $RxObservable: Rx.ObservableStatic;

/**
 * A reference to the Promise object, or an injected Promise-like object.
 * @see EventStation.inject()
 */
var $Promise: typeof Promise = Promise;

/** Generates a unique ID for EventStation instances */
function makeStationId(): EventStation.StationId {
    return String(++stationIdIterator);
}

/** Creates a new station meta object from the given configuration options */
function makeStationMeta(opts: EventStation.Options = {}): EventStation.Meta {

    const glob = globalOptions;
    var undef: any;

    return {
        stationId:            makeStationId(),
        listenerCount:        0,
        hearingCount:         0,
        listenersMap:         Object.create(null),
        heardStations:        Object.create(null),
        isPropagationStopped: false,
        emitAllEvent:         opts.emitAllEvent    === undef ? glob.emitAllEvent    : opts.emitAllEvent,
        enableRegExp:         opts.enableRegExp    === undef ? glob.enableRegExp    : opts.enableRegExp,
        regExpMarker:         opts.regExpMarker    === undef ? glob.regExpMarker    : opts.regExpMarker,
        enableDelimiter:      opts.enableDelimiter === undef ? glob.enableDelimiter : opts.enableDelimiter,
        delimiter:            opts.delimiter       === undef ? glob.delimiter       : opts.delimiter,
    };
}

/** Adds the given listener to the given station meta */
function addListener(stationMeta: EventStation.Meta, listener: EventStation.Listener): void {

    const eventName = listener.eventName;
    const listenersMap = stationMeta.listenersMap;

    if (listenersMap[eventName] === undefined) {
        listenersMap[eventName] = [];
    }

    const stationMetas = listener.stationMetas;

    if (stationMetas === undefined) {
        listener.stationMetas = [stationMeta];
    } else {
        stationMetas.push(stationMeta);
    }

    listenersMap[eventName].push(listener);
    stationMeta.listenerCount++;

    const hearer = listener.hearer;

    if (hearer !== undefined) {
        hearer.stationMeta.hearingCount++;
    }
}

/**
 * Removes all listeners that match the given listener from the given station meta.
 * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
 */
function removeListener(stationMeta: EventStation.Meta, listener: EventStation.Listener, exactMatch?: boolean): void {

    if (stationMeta.listenerCount < 1) return;

    const listenersMap = stationMeta.listenersMap;
    const eventName = listener.eventName;
    const attachedListeners = listenersMap[eventName];

    if (attachedListeners === undefined) return;

    let attachedListenersCount = attachedListeners.length;

    if (attachedListenersCount === 1) {

        if ( ! matchListener(listener, attachedListeners[0], exactMatch)) return;

        delete listenersMap[eventName];
        stationMeta.listenerCount--;
        reduceHearerHearingCount(listener);
        removeMetaFromStation(stationMeta, listener);

        return;
    }

    for (let i = 0, c = attachedListenersCount; i < c; i++) {

        let attachedListener = attachedListeners[i];

        if ( ! matchListener(listener, attachedListener, exactMatch)) continue;

        /* Remove the listener from the given EventStation.Meta */
        attachedListeners.splice(i, 1);
        stationMeta.listenerCount--;
        i--;
        c--;

        reduceHearerHearingCount(listener);
        removeMetaFromStation(stationMeta, listener);
    }

    if (attachedListeners.length < 1) {
        delete listenersMap[eventName];
    }
}

/**
 * Determines whether the given listener is attached to the given station meta.
 * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
 */
function hasListener(stationMeta: EventStation.Meta, listener: EventStation.MatchListener, exactMatch?: boolean): boolean {

    const listenersMap = stationMeta.listenersMap;
    const eventName = listener.eventName;
    var attachedListeners: EventStation.Listener[];

    if (eventName === undefined) {
        attachedListeners = getAllListeners(stationMeta);
    } else {
        attachedListeners = listenersMap[eventName];
        if (attachedListeners === undefined) {
            return false;
        }
    }

    return matchListeners(listener, attachedListeners, exactMatch);
}

/**
 * Determines whether the given station meta has listeners that match the given listeners
 * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
 */
function hasListeners(stationMeta: EventStation.Meta, listeners: EventStation.MatchListener[], exactMatch?: boolean): boolean {

    for (let i = 0, c = listeners.length; i < c; i++) {
        if (hasListener(stationMeta, listeners[i], exactMatch)) {
            return true;
        }
    }

    return false;
}

/** Determines whether the given listener is attached to any stations */
function isListenerAttached(listener: EventStation.Listener): boolean {
    return listener.stationMetas !== undefined;
}

/** Determines whether the given listeners are attached to any stations */
function isListenersAttached(listeners: EventStation.Listener[]): boolean {

    for (let i = 0, c = listeners.length; i < c; i++) {
        if (isListenerAttached(listeners[i])) {
            return true;
        }
    }

    return false;
}

/**
 * Determines whether the given listeners match by performing an approximate match
 * using the `matchCallback`, `matchContext`, `hearer`, and `eventName` properties.
 * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
 */
function matchListener(matchingListener: EventStation.MatchListener, attachedListener: EventStation.MatchListener, exactMatch?: boolean): boolean {

    if (exactMatch === true) {
        return matchingListener == attachedListener;
    }

    const matchCallback = matchingListener.matchCallback;

    if (
        matchCallback !== undefined
        && matchCallback !== attachedListener.matchCallback
    ) {
        return false
    }

    const matchContext = matchingListener.matchContext;

    if (
        matchContext !== undefined
        && matchContext !== attachedListener.matchContext
    ) {
        return false
    }

    const hearer = matchingListener.hearer;

    if (
        hearer !== undefined
        && hearer !== attachedListener.hearer
    ) {
        return false
    }

    const eventName = matchingListener.eventName;

    if (
        eventName !== undefined
        && eventName !== attachedListener.eventName
    ) {
        return false
    }

    return true;
}

function matchListeners(matchingListener: EventStation.MatchListener, attachedListeners: EventStation.MatchListener[], exactMatch?: boolean): boolean {

    const count = attachedListeners.length;

    if (count < 1) return false;

    for (let i = 0; i < count; i++) {

        let attachedListener = attachedListeners[i];

        if (matchListener(matchingListener, attachedListener, exactMatch)) {
            return true;
        }
    }

    return false;
}

/** Applies the given listeners with the given arguments */
function applyListeners<P extends Promise<any>>(listeners: EventStation.Listener[], originStation: EventStation, enableAsync: boolean, args: EventStation.ListenerArguments): P[] {

    const argsLength = args.length;
    const stationMeta = originStation.stationMeta;

    stationMeta.isPropagationStopped = false;

    var promises: P[];

    if (enableAsync) promises = [];

    var result: any;

    for (let i = 0, c = listeners.length; i < c; i++) {

        if (stationMeta.isPropagationStopped) {
            stationMeta.isPropagationStopped = false;
            return;
        }

        const listener = listeners[i];

        if (listener.isPaused) continue;

        const callback = listener.callback;
        const context = listener.context;

        switch (argsLength) {
            case 0:
                result = callback.call(context);
                break;
            case 1:
                result = callback.call(context, args[0]);
                break;
            case 2:
                result = callback.call(context, args[0], args[1]);
                break;
            case 3:
                result = callback.call(context, args[0], args[1], args[2]);
                break;
            default:
                result = callback.apply(context, args);
                break;
        }

        /*
         * Is async enabled, and is the result a Promise-like object
         */
        if (
            enableAsync
            && result !== undefined
            && typeof result.then === 'function'
            && typeof result.catch === 'function'
        ) {
            promises.push(<P>result);
        }

        const resolves = listener.resolves;

        if (resolves !== undefined) {

            for (let i = 0, c = resolves.length; i < c; i++) {
                resolves[i](listener);
            }

            listener.resolves = undefined;
        }

        const maxOccurrences = listener.maxOccurrences;
        let occurrences = listener.occurrences;

        if (maxOccurrences !== undefined) {

            if (occurrences === undefined) {
                occurrences = listener.occurrences = 1;
            } else {
                occurrences = ++listener.occurrences;
            }

            if (occurrences === maxOccurrences) {
                removeListenerFromAll(listener);
            }
        }
    }

    return promises;
}

/** Creates a `Promise` and adds its `resolve` function to the listener's `resolves` array */
function makePromise(listener: EventStation.Listener): Promise<EventStation.Listener> {

    if ($Promise === undefined) {
        throw new Error('No promises implementation available.');
    }

    return new $Promise<EventStation.Listener>(function (resolve) {

        if (listener.resolves === undefined){
            listener.resolves = [resolve];
        } else {
            listener.resolves.push(resolve);
        }
    });
}

/**
 * Clones the given listener
 * Does not clone the listener's `stationMetas` or `resolves` properties
 * @throws an `Error` if the listener is a cross-emitter listener
 */
function cloneListener(listener: EventStation.Listener): EventStation.Listener {

    if (listener.hearer !== undefined) {
        throw new Error("Cross-emitter listeners can not be cloned.");
    }

    return {
        eventName: listener.eventName,
        callback: listener.callback,
        context: listener.context,
        matchCallback: listener.matchCallback,
        matchContext: listener.matchContext,
        isPaused: listener.isPaused,
        occurrences: listener.occurrences,
        maxOccurrences: listener.maxOccurrences,
    };
}

/** Retrieves all listeners attached to the given EventStation.Meta */
function getAllListeners(stationMeta: EventStation.Meta): EventStation.Listener[] {

    if (stationMeta.listenerCount < 1) return [];

    const listenersMap = stationMeta.listenersMap;
    var listeners: EventStation.Listener[] = [];

    for (let eventName in listenersMap) {
        listeners = listeners.concat(listenersMap[eventName]);
    }

    return listeners;
}

/**
 * @returns the heard stations of a given station's meta as an array
 */
function getHeardStations(stationMeta: EventStation.Meta): EventStation[] {

    const stations: EventStation[] = [];
    const heardStations = stationMeta.heardStations;

    for (let stationId in heardStations) {
        stations.push(heardStations[stationId]);
    }

    return stations;
}

/**
 * Retrieves the targeted stations from the given parameters
 * This function normalizes the the target station for
 * cross-emitter listening methods.
 */
function getTargetedStations(stationMeta: EventStation.Meta, target?: EventStation | EventStation[]): EventStation[] {

    if (target === undefined) {
        return getHeardStations(stationMeta);
    }

    if (Array.isArray(target)) {
        return <EventStation[]>target;
    }

    if ((<EventStation>target).stationMeta !== undefined) {
        return [<EventStation>target];
    }

    throw new Error("Invalid target");
}

/**
 * Makes an array of listeners from the given parameters
 * This function normalizes the four ways to make listeners.
 */
function makeListeners(originStation: EventStation.Emitter, isMatching: boolean, listenerMap: EventStation.CallbackMap, context?: EventStation): EventStation.Listener[];
function makeListeners(originStation: EventStation.Emitter, isMatching: boolean, eventNames: string[], callback?: Function, context?: EventStation): EventStation.Listener[];
function makeListeners(originStation: EventStation.Emitter, isMatching: boolean, eventName: string, callback?: Function, context?: EventStation): EventStation.Listener[];
function makeListeners(originStation: EventStation.Emitter, isMatching: boolean, q: any, r?: any, s?: any): EventStation.Listener[] {

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
            context: ! isMatching && s === undefined ? originStation : s,
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
function makeListenersFromMap(originStation: EventStation.Emitter, isMatching: boolean, listenerMap: EventStation.CallbackMap, context: any): EventStation.Listener[] {

    const listeners: EventStation.Listener[] = [];

    for (let eventName in listenerMap) {

        listeners.push({
            eventName: eventName,
            callback: listenerMap[eventName],
            context: ! isMatching && context === undefined ? originStation : context,
            matchCallback: listenerMap[eventName],
            matchContext: context,
        });
    }

    return listeners;
}

/** Makes an array of listeners from the given event name array */
function makeListenersFromArray(originStation: EventStation.Emitter, isMatching: boolean, eventNames: string[], callback: Function, context: any): EventStation.Listener[] {

    const listeners: EventStation.Listener[] = [];

    for (let i = 0, l = eventNames.length; i < l; i++) {

        listeners.push({
            eventName: eventNames[i],
            callback: callback,
            context: ! isMatching && context === undefined ? originStation : context,
            matchContext: context,
            matchCallback: callback,
        });
    }

    return listeners;
}

/**
 * Retrieves listeners from the given listener map
 * that match the given event name. Specifically,
 * this function recognizes regular expression listeners.
 */
function searchListeners(eventName: string, listenersMap: EventStation.ListenersMap, regExpMarker: string): EventStation.Listener[] {

    var listeners: EventStation.Listener[] = [];

    for (let expression in listenersMap) {

        if (expression.indexOf(regExpMarker) === 0) {

            if (new RegExp(expression.substr(1)).test(eventName)) {
                listeners = listeners.concat(listenersMap[expression]);
            }

        } else if (expression === eventName) {

            listeners = listeners.concat(listenersMap[eventName]);
        }
    }

    return listeners;
}

/** Removes the given listener from all of the station meta it's attached to */
function removeListenerFromAll(listener: EventStation.Listener): void {

    const stationMetas = listener.stationMetas;

    for (let i = 0, c = stationMetas.length; i < c; i++) {
        removeListener(stationMetas[i], listener, true);
    }
}

/** Removes all listeners for a particular event from the given station meta */
function removeListeners(eventName: string, stationMeta: EventStation.Meta): void {

    const listenersMap = stationMeta.listenersMap;
    const listeners = listenersMap[eventName];

    if (listeners === undefined) return;

    const count = listeners.length;

    for (let i = 0; i < count; i++) {

        const listener = listeners[i];
        const hearer = listener.hearer;

        if (hearer !== undefined) {
            hearer.stationMeta.hearingCount--;
        }
    }

    stationMeta.listenerCount = stationMeta.listenerCount - count;
    delete listenersMap[eventName];
}

/** Removes all listeners from then given station meta */
function removeAllListeners(stationMeta: EventStation.Meta): void {

    const listenersMap = stationMeta.listenersMap;

    for (let eventName in listenersMap) {

        const listeners = listenersMap[eventName];

        for (let i = 0, c = listeners.length; i < c; i++) {

            const listener = listeners[i];
            const hearer = listener.hearer;

            if (hearer !== undefined) {
                hearer.stationMeta.hearingCount--;
            }
        }
    }

    stationMeta.listenerCount = 0;
    stationMeta.listenersMap = Object.create(null);
}

/** Clean the `heardStations` property of the meta of the given station */
function cleanHeardStations(station: EventStation): void {

    const stationMap: EventStation.StationMap = Object.create(null);
    const heardStations = station.stationMeta.heardStations;

    for (let stationId in heardStations) {

        const heardStation = heardStations[stationId];

        if (hasListener(heardStation.stationMeta, { hearer: station })) {
            stationMap[stationId] = heardStation;
        }
    }

    station.stationMeta.heardStations = stationMap;
}

function reduceHearerHearingCount(listener: EventStation.Listener): void {

    /*
     * Update the hearingCount of given listener's hearer
     */
    const hearer = listener.hearer;

    if (hearer !== undefined) {
        hearer.stationMeta.hearingCount--;
    }
}

function removeMetaFromStation(targetMeta: EventStation.Meta, listener: EventStation.Listener) {

    const stationMetas = listener.stationMetas;

    if (stationMetas === undefined) return;

    let stationMetasCount = stationMetas.length;

    if (stationMetasCount === 1) {
        if (stationMetas[0] === targetMeta) {
            listener.stationMetas = undefined;
        }
        return;
    }

    const newStationMetas: EventStation.Meta[] = [];

    for (let i = 0; i < stationMetasCount; i++) {
        const stationMeta = stationMetas[i];
        if (stationMeta !== targetMeta) {
            newStationMetas.push(stationMeta);
        }
    }

    if (newStationMetas.length < 1) {
        /*
         * This line is necessary in the rare case that
         * the exact same listener object has been added to
         * a station multiple times, and is then removed from
         * said station.
         */
        listener.stationMetas = undefined;
    } else {
        listener.stationMetas = newStationMetas;
    }
}

interface GetNamesOptions {
    enableDelimiter?: boolean;
    delimiter?: string;
}

function parseEventNames(eventNames: string[], options?: GetNamesOptions): string[];
function parseEventNames(eventName: string, options?: GetNamesOptions): string[];
function parseEventNames(input: any, options: GetNamesOptions = {}): string[] {

    var names: string[];

    if (typeof input === 'string') {

        const delimiter = options.delimiter;

        if (options.enableDelimiter && input.indexOf(delimiter) >= 0) {
            names = (<string>input).split(delimiter);
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

function emitEvent<P extends Promise<any>>(eventName: string, originStation: EventStation.Emitter, enableAsync: boolean, args: any[]): P[] {

    const stationMeta = originStation.stationMeta;
    const listenersMap = stationMeta.listenersMap;

    var listeners: EventStation.Listener[];

    if (stationMeta.enableRegExp) {
        listeners = searchListeners(eventName, listenersMap, stationMeta.regExpMarker);
    } else {
        listeners = listenersMap[eventName];
    }

    var promises: P[];

    if (enableAsync) promises = [];

    if (listeners !== undefined) {

        let result = applyListeners<P>(listeners, originStation, enableAsync, args);

        if (enableAsync && result !== undefined) {
            promises = promises.concat(result);
        }
    }

    var listenersAll: EventStation.Listener[];

    if (stationMeta.emitAllEvent) {
        listenersAll = listenersMap.all;
    }

    if (listenersAll !== undefined) {

        let argsAll = args.slice();
        argsAll.splice(0, 0, eventName);

        let result = applyListeners<P>(listenersAll, originStation, enableAsync, argsAll);

        if (enableAsync && result !== undefined) {
            promises = promises.concat(result);
        }
    }

    return promises;
}

namespace EventStation {

    /** A semantic alias */
    export type StationId = string;

    /** An interface to accommodate objects that extend EventStation */
    export interface Emitter extends EventStation {}

    /**
     * A subset of the Listener interface used only for
     * comparing two Listener objects.
     * @see Listener
     * @see matchListener()
     */
    export interface MatchListener {
        /** @see Listener.eventName */
        eventName?: string;
        /** @see Listener.matchCallback */
        matchCallback?: Function;
        /** @see Listener.matchContext */
        matchContext?: any;
        /** @see Listener.hearer */
        hearer?: EventStation.Emitter;
    }

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
         * Use in cross-emitter listeners
         * The station that attached the listener to it's origin station.
         */
        hearer?: EventStation.Emitter;
        /**
         * Use in cross-emitter listeners
         * The origin station of the listener which was attached by `hearer`
         */
        crossOrigin?: EventStation.Emitter;
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
    export interface CallbackMap {
        [eventName: string]: Function;
    }

    /**
     * See the [configuration section](http://morrisallison.bitbucket.org/event-station/usage.html#configuration)
     * of the usage documentation for general usage.
     */
    export interface Options {
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
    export interface ListenersMap {
        all: EventStation.Listener[];
        [eventName: string]: EventStation.Listener[];
    }

    /** An object of station instances with unique station IDs as keys */
    export interface StationMap {
        [stationId: string]: EventStation.Emitter;
    }

    export interface Meta {
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

    export interface ListenerArguments {
        [index: number]: any;
        length: number;
    }

    export interface ListenerPromiseResolve {
        (value?: EventStation.Listener | Promise<EventStation.Listener>): void;
    }

    export interface ForEachCallback {
        (listener: EventStation.Listener, index: number, listeners: EventStation.Listener[]): any;
    }
}

/*
 * ES6 module support
 */
Object.defineProperty(EventStation, '__esModule', { value: true });
(<any>EventStation).default = EventStation;

export = EventStation;