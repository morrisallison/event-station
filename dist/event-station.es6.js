/*
 * event-station v1.1.4
 * Copyright (c) Morris Allison III <author@morris.xyz> (http://morris.xyz). All rights reserved.
 * Released under the MIT license
 * @preserve
 */
/** Adds the given listener to the given station meta */
function addListener(stationMeta, listener) {
    const eventName = listener.eventName;
    const listenersMap = stationMeta.listenersMap;
    if (!listenersMap[eventName]) {
        listenersMap[eventName] = [];
    }
    const stationMetas = listener.stationMetas;
    if (!stationMetas) {
        listener.stationMetas = [stationMeta];
    }
    else {
        stationMetas.push(stationMeta);
    }
    listenersMap[eventName].push(listener);
    stationMeta.listenerCount++;
    const hearer = listener.hearer;
    if (hearer) {
        hearer.stationMeta.hearingCount++;
    }
}

/**
 * Determines whether the given listeners match by performing an approximate match
 * using the `matchCallback`, `matchContext`, `hearer`, and `eventName` properties.
 * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
 */
function matchListener(matchingListener, attachedListener, exactMatch) {
    if (exactMatch === true) {
        return matchingListener === attachedListener;
    }
    const matchCallback = matchingListener.matchCallback;
    if (matchCallback
        && matchCallback !== attachedListener.matchCallback) {
        return false;
    }
    const matchContext = matchingListener.matchContext;
    if (matchContext !== undefined
        && matchContext !== attachedListener.matchContext) {
        return false;
    }
    const hearer = matchingListener.hearer;
    if (hearer
        && hearer !== attachedListener.hearer) {
        return false;
    }
    const eventName = matchingListener.eventName;
    if (eventName !== undefined
        && eventName !== attachedListener.eventName) {
        return false;
    }
    return true;
}

/**
 * Removes all listeners that match the given listener from the given station meta.
 * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
 */
function removeListener(stationMeta, listener, exactMatch) {
    if (stationMeta.listenerCount < 1)
        return;
    const listenersMap = stationMeta.listenersMap;
    const eventName = listener.eventName;
    const attachedListeners = listenersMap[eventName];
    if (!attachedListeners)
        return;
    const attachedListenersCount = attachedListeners.length;
    if (attachedListenersCount === 1) {
        if (!matchListener(listener, attachedListeners[0], exactMatch))
            return;
        delete listenersMap[eventName];
        stationMeta.listenerCount--;
        reduceHearerHearingCount(listener);
        removeMetaFromStation(stationMeta, listener);
        return;
    }
    for (let i = 0, c = attachedListenersCount; i < c; i++) {
        const attachedListener = attachedListeners[i];
        if (!matchListener(listener, attachedListener, exactMatch))
            continue;
        /* Remove the listener from the given Meta */
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
function removeMetaFromStation(targetMeta, listener) {
    const stationMetas = listener.stationMetas;
    if (!stationMetas)
        return;
    if (stationMetas.length === 1) {
        listener.stationMetas = undefined;
        return;
    }
    const newStationMetas = [];
    for (const stationMeta of stationMetas) {
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
    }
    else {
        listener.stationMetas = newStationMetas;
    }
}
function reduceHearerHearingCount(listener) {
    /*
     * Update the hearingCount of given listener's hearer
     */
    const hearer = listener.hearer;
    if (hearer) {
        hearer.stationMeta.hearingCount--;
    }
}

/** Removes the given listener from all of the station meta it's attached to */
function removeListenerFromAll(listener) {
    const stationMetas = listener.stationMetas;
    if (!stationMetas)
        return;
    for (const stationMeta of stationMetas) {
        removeListener(stationMeta, listener, true);
    }
}

/** Applies the given listeners with the given arguments */
function applyListeners(listeners, originStation, enableAsync, args) {
    const argsLength = args.length;
    const stationMeta = originStation.stationMeta;
    stationMeta.isPropagationStopped = false;
    const promises = [];
    let result;
    /* Clone array to prevent mutation */
    listeners = listeners.slice();
    for (const listener of listeners) {
        if (stationMeta.isPropagationStopped) {
            stationMeta.isPropagationStopped = false;
            return;
        }
        if (listener.isPaused)
            continue;
        const callback = listener.callback;
        const context = listener.context;
        if (callback) {
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
        }
        /*
         * Is async enabled, and is the result a Promise-like object
         */
        if (enableAsync
            && result
            && typeof result.then === 'function'
            && typeof result.catch === 'function') {
            promises.push(result);
        }
        const resolves = listener.resolves;
        if (resolves) {
            for (const resolve of resolves) {
                resolve(listener);
            }
            listener.resolves = undefined;
        }
        const { maxOccurrences } = listener;
        let { occurrences } = listener;
        if (maxOccurrences !== undefined) {
            if (occurrences === undefined) {
                occurrences = 0;
            }
            listener.occurrences = ++occurrences;
            if (occurrences === maxOccurrences) {
                removeListenerFromAll(listener);
            }
        }
    }
    return promises;
}

/** Retrieves all listeners attached to the given Meta */
function getAllListeners(stationMeta) {
    if (stationMeta.listenerCount < 1)
        return [];
    const listenersMap = stationMeta.listenersMap;
    let listeners = [];
    // `listenersMap` has no prototype
    // tslint:disable-next-line:no-for-in forin
    for (const eventName in listenersMap) {
        listeners = listeners.concat(listenersMap[eventName]);
    }
    return listeners;
}

function matchListeners(matchingListener, attachedListeners, exactMatch) {
    const count = attachedListeners.length;
    if (count < 1)
        return false;
    for (const attachedListener of attachedListeners) {
        if (matchListener(matchingListener, attachedListener, exactMatch)) {
            return true;
        }
    }
    return false;
}

/**
 * Determines whether the given listener is attached to the given station meta.
 * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
 */
function hasListener(stationMeta, listener, exactMatch) {
    const listenersMap = stationMeta.listenersMap;
    const eventName = listener.eventName;
    let attachedListeners;
    if (eventName === undefined) {
        attachedListeners = getAllListeners(stationMeta);
    }
    else {
        attachedListeners = listenersMap[eventName];
        if (!attachedListeners) {
            return false;
        }
    }
    return matchListeners(listener, attachedListeners, exactMatch);
}

var deps;
(function (deps) {
    /**
     * A reference to the injected Rx namespace.
     * @see inject()
     */
    deps.$RxObservable = undefined;
    /**
     * A reference to the Promise object, or an injected Promise-like object.
     * @see inject()
     */
    deps.$Promise = getGlobalPromise();
})(deps || (deps = {}));
function inject(name, obj) {
    switch (name) {
        case 'rx':
            deps.$RxObservable = obj ? obj.Observable : obj;
            break;
        case 'Promise':
            deps.$Promise = obj;
            break;
        default:
            throw new Error('Invalid name');
    }
}
/** Reset injected dependencies */
function reset() {
    deps.$RxObservable = undefined;
    deps.$Promise = getGlobalPromise();
}
function getGlobalPromise() {
    const glob = typeof window === 'object' ? window : global;
    return glob.Promise;
}

const errors = {
    NO_PROMISE: 'No promises implementation available.'
};
/**
 * A class for operations targeting a collection of listeners
 */
class Listeners {
    /** @returns The number of listeners in the collection */
    get count() {
        return this.listeners.length;
    }
    constructor(originStation, listeners) {
        this.originStation = originStation;
        this.listeners = listeners;
    }
    /**
     * Sets each listener's maximum occurrence
     */
    occur(maxOccurrences) {
        if (maxOccurrences < 1) {
            throw new Error(`The maximum occurrences must be greater than or equal to one.`);
        }
        const listeners = this.listeners;
        for (const listener of listeners) {
            listener.maxOccurrences = maxOccurrences;
        }
        return this;
    }
    /**
     * Sets each listener's callback function
     */
    calling(callback) {
        const listeners = this.listeners;
        for (const listener of listeners) {
            listener.callback = callback;
            listener.matchCallback = callback;
        }
        return this;
    }
    /**
     * Sets each listener's callback function, and maximum occurrence to one(1)
     */
    once(callback) {
        return this.calling(callback).occur(1);
    }
    /**
     * Removes the listeners from all stations
     */
    off() {
        const listeners = this.listeners;
        for (const listener of listeners) {
            removeListenerFromAll(listener);
        }
        return this;
    }
    /**
     * Sets the context of each listener
     */
    using(context) {
        const listeners = this.listeners;
        for (const listener of listeners) {
            listener.context = context;
            listener.matchContext = context;
        }
        return this;
    }
    /**
     * Adds each listener to the given station
     */
    addTo(station) {
        const listeners = this.listeners;
        const stationMeta = station.stationMeta;
        for (const listener of listeners) {
            const crossOrigin = listener.crossOrigin;
            if (crossOrigin && crossOrigin !== station) {
                throw new Error(`Cross-emitter listeners can only be attached to their origin station.`);
            }
            addListener(stationMeta, listener);
        }
        return this;
    }
    /**
     * Removes each listener from the given station
     */
    removeFrom(station) {
        const listeners = this.listeners;
        const stationMeta = station.stationMeta;
        for (const listener of listeners) {
            removeListener(stationMeta, listener, true);
        }
        return this;
    }
    /**
     * Moves the listeners to another station.
     * This method changes the origin station.
     */
    moveTo(station) {
        this.removeFrom(this.originStation);
        this.originStation = station;
        this.addTo(station);
        return this;
    }
    /**
     * Determines whether any listener in the collection matches the given listener.
     * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
     */
    has(matchingListener, exactMatch) {
        return matchListeners(matchingListener, this.listeners, exactMatch);
    }
    /**
     * Adds the listeners to the origin station
     */
    attach() {
        return this.addTo(this.originStation);
    }
    /**
     * Removes the listeners from the origin station
     */
    detach() {
        return this.removeFrom(this.originStation);
    }
    /**
     * Determines whether any of the listeners are attached to the given station.
     * If no station is given, the method determines whether any of the listeners
     * are attached to *any* station.
     */
    isAttachedTo(station) {
        if (!station) {
            return isListenersAttached(this.listeners);
        }
        return hasListeners(station.stationMeta, this.listeners, true);
    }
    /**
     * Determines whether any of the listeners are attached to the origin station
     */
    isAttached() {
        return this.isAttachedTo(this.originStation);
    }
    /**
     * Pauses each listener
     */
    pause() {
        const listeners = this.listeners;
        for (const listener of listeners) {
            listener.isPaused = true;
        }
        return this;
    }
    /**
     * Un-pauses each listener
     */
    resume() {
        const listeners = this.listeners;
        for (const listener of listeners) {
            listener.isPaused = false;
        }
        return this;
    }
    /**
     * Determines whether any of listeners are paused
     */
    isPaused() {
        const listeners = this.listeners;
        for (const listener of listeners) {
            if (listener.isPaused)
                return true;
        }
        return false;
    }
    /**
     * @returns An iterable object (array) containing a promise
     * for each listener that resolves when said listener is applied.
     * This method is dependant on `Promise`.
     * @see inject()
     */
    toPromises() {
        const promises = [];
        const listeners = this.listeners;
        const count = listeners.length;
        for (let i = 0; i < count; i++) {
            const listener = listeners[i];
            promises[i] = makePromise(listener);
        }
        return promises;
    }
    /**
     * @returns A promise that resolves when all of the listeners
     * have been applied at least once.
     * This method is dependant on `Promise`.
     * @see inject()
     */
    all() {
        if (!deps.$Promise) {
            throw new Error(errors.NO_PROMISE);
        }
        return deps.$Promise.all(this.toPromises());
    }
    /**
     * @returns A promise that resolves when one of the listeners is applied.
     * This method is dependant on `Promise`.
     * @see inject()
     */
    race() {
        if (!deps.$Promise) {
            throw new Error(errors.NO_PROMISE);
        }
        return deps.$Promise.race(this.toPromises());
    }
    /**
     * Un-pauses each listener, and resets each listener's occurrence count
     */
    reset() {
        const listeners = this.listeners;
        for (const listener of listeners) {
            listener.occurrences = undefined;
            listener.isPaused = undefined;
        }
        return this;
    }
    /** Similar to Array.prototype.forEach() */
    forEach(func) {
        const listeners = this.listeners;
        const count = listeners.length;
        for (let i = 0; i < count; i++) {
            const listener = listeners[i];
            func(listener, i, listeners);
        }
        return this;
    }
    /** Retrieves a listener located at the given index */
    // tslint:disable-next-line:no-reserved-keywords
    get(index) {
        return this.listeners[index];
    }
    /** Retrieves the index of the given listener */
    index(listener) {
        const listeners = this.listeners;
        const count = listeners.length;
        for (let i = 0; i < count; i++) {
            if (listener === listeners[i])
                return i;
        }
    }
    /**
     * @returns A new `Listeners` object containing a clone of each Listener
     */
    clone() {
        const clonedListeners = this.listeners.map(cloneListener);
        return new Listeners(this.originStation, clonedListeners);
    }
}
/** Creates a `Promise` and adds its `resolve` function to the listener's `resolves` array */
function makePromise(listener) {
    if (!deps.$Promise) {
        throw new Error(errors.NO_PROMISE);
    }
    return new deps.$Promise((resolve) => {
        if (!listener.resolves) {
            listener.resolves = [resolve];
        }
        else {
            listener.resolves.push(resolve);
        }
    });
}
/**
 * Clones the given listener
 * Does not clone the listener's `stationMetas` or `resolves` properties
 * @throws an `Error` if the listener is a cross-emitter listener
 */
function cloneListener(listener) {
    if (listener.hearer) {
        throw new Error(`Cross-emitter listeners can't be cloned.`);
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
/** Determines whether the given listeners are attached to any stations */
function isListenersAttached(listeners) {
    for (const listener of listeners) {
        if (isListenerAttached(listener)) {
            return true;
        }
    }
    return false;
}
/** Determines whether the given listener is attached to any stations */
function isListenerAttached(listener) {
    return listener.stationMetas !== undefined;
}
/**
 * Determines whether the given station meta has listeners that match the given listeners
 * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
 */
function hasListeners(stationMeta, listeners, exactMatch) {
    for (const listener of listeners) {
        if (hasListener(stationMeta, listener, exactMatch)) {
            return true;
        }
    }
    return false;
}

/** Iterator for generating unique station IDs */
let stationIdIterator = 0;
/** Generates a unique ID for EventStation instances */
function makeStationId() {
    return String(++stationIdIterator);
}

const allEvent = 'all';
/** Container for global configuration options */
const defaultOptions = {
    delimiter: ' ',
    emitAllEvent: true,
    enableDelimiter: true,
    enableRegExp: false,
    regExpMarker: '%',
};
/** Container for global configuration options */
const globalOptions = mergeOptions({}, defaultOptions);
/** Resets the global configuration to defaults */
function reset$1() {
    mergeOptions(globalOptions, defaultOptions);
}
/** Modifies the default global configuration */
function config(opts) {
    const testOptions = mergeOptions({}, globalOptions, opts);
    assertOptions(testOptions);
    mergeOptions(globalOptions, opts);
}
/**
 * Validates the given options
 * @throws Error
 */
function assertOptions(opts) {
    if (opts.delimiter === '') {
        throw new Error(`Invalid option: Delimiters can't be empty strings.`);
    }
    if (opts.regExpMarker === '') {
        throw new Error(`Invalid option: RegExp markers can't be empty strings.`);
    }
    if (opts.regExpMarker && opts.delimiter && opts.regExpMarker.indexOf(opts.delimiter) >= 0) {
        throw new Error(`Invalid option: RegExp markers can't contain the delimiter string.`);
    }
}
function mergeOptions(target) {
    for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];
        // tslint:disable-next-line:no-for-in forin
        for (const option in source) {
            const isValidOption = defaultOptions.hasOwnProperty(option);
            const value = source[option];
            if (isValidOption && value != null) {
                target[option] = value;
            }
        }
    }
    return target;
}

/**
 * Event emitter class and namespace
 */
class EventStation$1 {
    constructor(options) {
        EventStation$1.init(this, options);
    }
    /** An ID unique to all stations */
    get stationId() {
        return this.stationMeta.stationId;
    }
    /** Number of listeners attached to the station */
    get listenerCount() {
        return this.stationMeta.listenerCount;
    }
    /**
     * Number of listeners attached to other stations by the station.
     * This value is increased by using `hear()` and `hearOnce()`.
     */
    get hearingCount() {
        return this.stationMeta.hearingCount;
    }
    /** Array of event names which have listeners on the station */
    get listenerEventNames() {
        return Object.getOwnPropertyNames(this.stationMeta.listenersMap);
    }
    on(q, r, s) {
        const stationMeta = this.stationMeta;
        const listeners = makeListeners(this, false, q, r, s);
        for (const listener of listeners) {
            addListener(stationMeta, listener);
        }
        return new Listeners(this, listeners);
    }
    once(q, r, s) {
        return this.on(q, r, s).occur(1);
    }
    off(q, r, s) {
        const stationMeta = this.stationMeta;
        if (stationMeta.listenerCount < 1)
            return;
        // If no listener targets were given
        if (q === undefined) {
            removeAllListeners(stationMeta);
            return;
        }
        if (r === undefined
            && s === undefined
            && typeof q === 'string'
            && (!stationMeta.enableDelimiter || q.indexOf(stationMeta.delimiter) < 0)) {
            removeListeners(q, stationMeta);
            return;
        }
        const listeners = makeListeners(this, true, q, r, s);
        for (const listener of listeners) {
            removeListener(stationMeta, listener);
        }
    }
    hear(station, q, r, s) {
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
    hearOnce(station, q, r, s) {
        return this.hear(station, q, r, s).occur(1);
    }
    disregard(target, q, r, s) {
        const stationMeta = this.stationMeta;
        if (stationMeta.hearingCount < 1)
            return;
        let isRemovingAll = false;
        let listeners = [];
        // If no listener targets were given
        if (q === undefined) {
            isRemovingAll = true;
        }
        else {
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
        }
        else {
            cleanHeardStations(this);
        }
    }
    isHeard(q, r, s) {
        const stationMeta = this.stationMeta;
        const listenerCount = stationMeta.listenerCount;
        if (listenerCount < 1)
            return false;
        if (arguments.length < 1) {
            // Determine if any listeners are attached
            return listenerCount > 0;
        }
        const listeners = makeListeners(this, true, q, r, s);
        for (const listener of listeners) {
            if (hasListener(stationMeta, listener))
                return true;
        }
        return false;
    }
    isHearing(target, q, r, s) {
        const stationMeta = this.stationMeta;
        if (stationMeta.hearingCount < 1)
            return false;
        const stations = getTargetedStations(stationMeta, target);
        let matchAllListeners = false;
        let listeners = [];
        // If no listener targets were given
        if (q) {
            listeners = makeListeners(this, true, q, r, s);
        }
        else {
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
                if (hasListener(targetStationMeta, listener))
                    return true;
            }
        }
        return false;
    }
    emit(input, ...args) {
        const stationMeta = this.stationMeta;
        if (stationMeta.listenerCount < 1)
            return;
        const eventNames = parseEventNames(input, stationMeta);
        for (const eventName of eventNames) {
            emitEvent(eventName, this, false, args);
        }
    }
    emitAsync(input, ...args) {
        if (!deps.$Promise) {
            throw new Error(`No promises implementation available.`);
        }
        const stationMeta = this.stationMeta;
        if (stationMeta.listenerCount < 1) {
            return deps.$Promise.resolve([]);
        }
        const eventNames = parseEventNames(input, stationMeta);
        let promises = [];
        for (const eventName of eventNames) {
            promises = promises.concat(emitEvent(eventName, this, true, args));
        }
        if (promises.length > 0) {
            return deps.$Promise.all(promises);
        }
        else {
            return deps.$Promise.resolve([]);
        }
    }
    makeListeners(q, r, s) {
        const listeners = makeListeners(this, false, q, r, s);
        return new Listeners(this, listeners);
    }
    getListeners(q, r, s) {
        const attachedListeners = getAllListeners(this.stationMeta);
        if (attachedListeners.length < 1) {
            return undefined;
        }
        if (arguments.length < 1) {
            return new Listeners(this, attachedListeners);
        }
        const matchingListeners = makeListeners(this, true, q, r, s);
        const listeners = [];
        for (const attachedListener of attachedListeners) {
            for (const matchingListener of matchingListeners) {
                if (matchListener(matchingListener, attachedListener)) {
                    listeners.push(attachedListener);
                    break;
                }
            }
        }
        // No matching listeners were found
        if (listeners.length < 1)
            return undefined;
        return new Listeners(this, listeners);
    }
    toObservable(q, s, selector) {
        if (!deps.$RxObservable) {
            throw new Error(`Rx has not been injected. See documentation for details.`);
        }
        const addHandler = (r) => {
            this.on(q, r, s);
        };
        const removeHandler = (r) => {
            this.off(q, r, s);
        };
        return deps.$RxObservable.fromEventPattern(addHandler, removeHandler, selector);
    }
    /**
     * Stops the propagation of an emitted event. When called, this method effectively does
     * nothing if an event is not being emitted at the time.
     */
    stopPropagation() {
        this.stationMeta.isPropagationStopped = true;
    }
    /**
     * Adds the given listener to the station
     */
    addListener(listener) {
        addListener(this.stationMeta, listener);
    }
    /**
     * Removes all listeners that match the given listener from the station
     * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
     */
    removeListener(listener, exactMatch) {
        removeListener(this.stationMeta, listener, exactMatch);
    }
    /**
     * Determines whether any listener attached to the station matches the given listener.
     * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
     */
    hasListener(listener, exactMatch) {
        return hasListener(this.stationMeta, listener, exactMatch);
    }
    /** Initializes the given object */
    static init(obj, options) {
        obj.stationMeta = makeStationMeta(options);
        return EventStation$1;
    }
    static inject(name, obj) {
        inject(name, obj);
        return EventStation$1;
    }
    /** Modifies the global configuration */
    static config(opts) {
        config(opts);
        return EventStation$1;
    }
    /** Resets the global configuration and injected dependencies */
    static reset() {
        reset$1();
        reset();
        return EventStation$1;
    }
    /**
     * Extends an object with EventStation's public members
     */
    static extend(obj) {
        const proto = EventStation$1.prototype;
        const properties = Object.keys(proto);
        for (const property of properties) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, property);
            const newDescriptor = { configurable: true };
            if (descriptor.get !== undefined) {
                newDescriptor.get = descriptor.get;
            }
            else {
                newDescriptor.value = descriptor.value;
            }
            Object.defineProperty(obj, property, newDescriptor);
        }
        return obj;
    }
    static make() {
        const station = EventStation$1.extend({});
        EventStation$1.init(station);
        return station;
    }
}
function parseEventNames(input, options) {
    let names;
    if (typeof input === 'string') {
        const delimiter = options.delimiter;
        if (options.enableDelimiter && delimiter) {
            names = input.split(delimiter);
        }
        else {
            names = [input];
        }
    }
    else if (Array.isArray(input)) {
        names = input;
    }
    else {
        throw new Error(`Invalid first argument`);
    }
    return names;
}
/** Creates a new station meta object from the given configuration options */
function makeStationMeta(options = {}) {
    const state = {
        heardStations: Object.create(null),
        hearingCount: 0,
        isPropagationStopped: false,
        listenerCount: 0,
        listenersMap: Object.create(null),
        stationId: makeStationId(),
    };
    const meta = mergeOptions(state, globalOptions, options);
    assertOptions(meta);
    return meta;
}
function makeListeners(origin, isMatching, q, r, s) {
    if (typeof q === 'string') {
        const stationMeta = origin.stationMeta;
        const enableDelimiter = stationMeta.enableDelimiter;
        const delimiter = stationMeta.delimiter;
        if (enableDelimiter && q.indexOf(delimiter) >= 0) {
            q = q.split(delimiter);
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
function makeListenersFromMap(originStation, isMatching, listenerMap, context) {
    const listeners = [];
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
function makeListenersFromArray(origin, isMatching, eventNames, callback, context) {
    const listeners = [];
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
function emitEvent(eventName, originStation, enableAsync, args) {
    const stationMeta = originStation.stationMeta;
    const listenersMap = stationMeta.listenersMap;
    let listeners;
    if (stationMeta.enableRegExp) {
        listeners = searchListeners(eventName, listenersMap, stationMeta.regExpMarker);
    }
    else {
        listeners = listenersMap[eventName];
    }
    let promises = [];
    if (listeners) {
        const result = applyListeners(listeners, originStation, enableAsync, args);
        if (enableAsync && result) {
            promises = promises.concat(result);
        }
    }
    const listenersMapAll = listenersMap[allEvent];
    if (stationMeta.emitAllEvent && listenersMapAll) {
        const argsAll = args.slice();
        argsAll.splice(0, 0, eventName);
        const result = applyListeners(listenersMapAll, originStation, enableAsync, argsAll);
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
function searchListeners(eventName, listenersMap, regExpMarker) {
    let listeners = [];
    // `listenersMap` has no prototype
    // tslint:disable-next-line:no-for-in forin
    for (const expression in listenersMap) {
        if (expression.indexOf(regExpMarker) === 0) {
            if (new RegExp(expression.substr(regExpMarker.length)).test(eventName)) {
                listeners = listeners.concat(listenersMap[expression]);
            }
        }
        else if (expression === eventName) {
            listeners = listeners.concat(listenersMap[eventName]);
        }
    }
    return listeners;
}
/** Clean the `heardStations` property of the meta of the given station */
function cleanHeardStations(station) {
    const stationMap = Object.create(null);
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
function removeAllListeners(stationMeta) {
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
function removeListeners(eventName, stationMeta) {
    const listenersMap = stationMeta.listenersMap;
    const listeners = listenersMap[eventName];
    if (listeners === undefined)
        return;
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
function getTargetedStations(stationMeta, target) {
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
function getHeardStations(stationMeta) {
    const stations = [];
    const heardStations = stationMeta.heardStations;
    // `heardStations` has no prototype
    // tslint:disable-next-line:no-for-in forin
    for (const stationId in heardStations) {
        stations.push(heardStations[stationId]);
    }
    return stations;
}

/* Set properties for module loader compatibility */
EventStation$1.EventStation = EventStation$1;
EventStation$1.default = EventStation$1;

export default EventStation$1;
//# sourceMappingURL=event-station.es6.js.map
