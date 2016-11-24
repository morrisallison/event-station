/*
 * event-station v1.1.0-beta
 * Copyright (c) 2016 Morris Allison III <author@morris.xyz> (http://morris.xyz)
 * Released under the MIT/Expat license
 * @preserve
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define('event-station', factory) :
    (global.EventStation = factory());
}(this, (function () { 'use strict';

/** Adds the given listener to the given station meta */
function addListener(stationMeta, listener) {
    var eventName = listener.eventName;
    var listenersMap = stationMeta.listenersMap;
    if (!listenersMap[eventName]) {
        listenersMap[eventName] = [];
    }
    var stationMetas = listener.stationMetas;
    if (!stationMetas) {
        listener.stationMetas = [stationMeta];
    }
    else {
        stationMetas.push(stationMeta);
    }
    listenersMap[eventName].push(listener);
    stationMeta.listenerCount++;
    var hearer = listener.hearer;
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
        return matchingListener == attachedListener;
    }
    var matchCallback = matchingListener.matchCallback;
    if (matchCallback
        && matchCallback !== attachedListener.matchCallback) {
        return false;
    }
    var matchContext = matchingListener.matchContext;
    if (matchContext !== undefined
        && matchContext !== attachedListener.matchContext) {
        return false;
    }
    var hearer = matchingListener.hearer;
    if (hearer
        && hearer !== attachedListener.hearer) {
        return false;
    }
    var eventName = matchingListener.eventName;
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
    var listenersMap = stationMeta.listenersMap;
    var eventName = listener.eventName;
    var attachedListeners = listenersMap[eventName];
    if (!attachedListeners)
        return;
    var attachedListenersCount = attachedListeners.length;
    if (attachedListenersCount === 1) {
        if (!matchListener(listener, attachedListeners[0], exactMatch))
            return;
        delete listenersMap[eventName];
        stationMeta.listenerCount--;
        reduceHearerHearingCount(listener);
        removeMetaFromStation(stationMeta, listener);
        return;
    }
    for (var i = 0, c = attachedListenersCount; i < c; i++) {
        var attachedListener = attachedListeners[i];
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
    var stationMetas = listener.stationMetas;
    if (!stationMetas)
        return;
    if (stationMetas.length === 1) {
        listener.stationMetas = undefined;
        return;
    }
    var newStationMetas = [];
    for (var _i = 0, stationMetas_1 = stationMetas; _i < stationMetas_1.length; _i++) {
        var stationMeta = stationMetas_1[_i];
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
    var hearer = listener.hearer;
    if (hearer) {
        hearer.stationMeta.hearingCount--;
    }
}

/** Removes the given listener from all of the station meta it's attached to */
function removeListenerFromAll(listener) {
    var stationMetas = listener.stationMetas;
    if (!stationMetas)
        return;
    for (var _i = 0, stationMetas_1 = stationMetas; _i < stationMetas_1.length; _i++) {
        var stationMeta = stationMetas_1[_i];
        removeListener(stationMeta, listener, true);
    }
}

/** Applies the given listeners with the given arguments */
function applyListeners(listeners, originStation, enableAsync, args) {
    var argsLength = args.length;
    var stationMeta = originStation.stationMeta;
    stationMeta.isPropagationStopped = false;
    var promises = [];
    var result;
    for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
        var listener = listeners_1[_i];
        if (stationMeta.isPropagationStopped) {
            stationMeta.isPropagationStopped = false;
            return;
        }
        if (listener.isPaused)
            continue;
        var callback = listener.callback;
        var context = listener.context;
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
        var resolves = listener.resolves;
        if (resolves) {
            for (var _a = 0, resolves_1 = resolves; _a < resolves_1.length; _a++) {
                var resolve = resolves_1[_a];
                resolve(listener);
            }
            listener.resolves = undefined;
        }
        var maxOccurrences = listener.maxOccurrences;
        var occurrences = listener.occurrences;
        if (maxOccurrences !== undefined) {
            if (occurrences === undefined) {
                occurrences = listener.occurrences = 1;
            }
            else {
                occurrences = ++listener.occurrences;
            }
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
    var listenersMap = stationMeta.listenersMap;
    var listeners = [];
    for (var eventName in listenersMap) {
        listeners = listeners.concat(listenersMap[eventName]);
    }
    return listeners;
}

function matchListeners(matchingListener, attachedListeners, exactMatch) {
    var count = attachedListeners.length;
    if (count < 1)
        return false;
    for (var _i = 0, attachedListeners_1 = attachedListeners; _i < attachedListeners_1.length; _i++) {
        var attachedListener = attachedListeners_1[_i];
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
    var listenersMap = stationMeta.listenersMap;
    var eventName = listener.eventName;
    var attachedListeners;
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

var glob = typeof window !== 'undefined' ? window : global;
var $DefaultPromise = glob.Promise;
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
    deps.$Promise = $DefaultPromise;
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
    deps.$Promise = $DefaultPromise;
}

/**
 * A class for operations targeting a collection of listeners
 */
var Listeners = (function () {
    function Listeners(originStation, listeners) {
        this.originStation = originStation;
        this.listeners = listeners;
    }
    Object.defineProperty(Listeners.prototype, "count", {
        /** @returns The number of listeners in the collection */
        get: function () {
            return this.listeners.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets each listener's maximum occurrence
     */
    Listeners.prototype.occur = function (maxOccurrences) {
        if (maxOccurrences < 1) {
            throw new Error("The maximum occurrences must be greater than or equal to one.");
        }
        var listeners = this.listeners;
        for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
            var listener = listeners_1[_i];
            listener.maxOccurrences = maxOccurrences;
        }
        return this;
    };
    /**
     * Sets each listener's callback function
     */
    Listeners.prototype.calling = function (callback) {
        var listeners = this.listeners;
        for (var _i = 0, listeners_2 = listeners; _i < listeners_2.length; _i++) {
            var listener = listeners_2[_i];
            listener.callback = callback;
            listener.matchCallback = callback;
        }
        return this;
    };
    /**
     * Sets each listener's callback function, and maximum occurrence to one(1)
     */
    Listeners.prototype.once = function (callback) {
        return this.calling(callback).occur(1);
    };
    /**
     * Removes the listeners from all stations
     */
    Listeners.prototype.off = function () {
        var listeners = this.listeners;
        for (var _i = 0, listeners_3 = listeners; _i < listeners_3.length; _i++) {
            var listener = listeners_3[_i];
            removeListenerFromAll(listener);
        }
        return this;
    };
    /**
     * Sets the context of each listener
     */
    Listeners.prototype.using = function (context) {
        var listeners = this.listeners;
        for (var _i = 0, listeners_4 = listeners; _i < listeners_4.length; _i++) {
            var listener = listeners_4[_i];
            listener.context = context;
            listener.matchContext = context;
        }
        return this;
    };
    /**
     * Adds each listener to the given station
     */
    Listeners.prototype.addTo = function (station) {
        var listeners = this.listeners;
        var stationMeta = station.stationMeta;
        for (var _i = 0, listeners_5 = listeners; _i < listeners_5.length; _i++) {
            var listener = listeners_5[_i];
            var crossOrigin = listener.crossOrigin;
            if (crossOrigin && crossOrigin !== station) {
                throw new Error("Cross-emitter listeners can only be attached to their origin station.");
            }
            addListener(stationMeta, listener);
        }
        return this;
    };
    /**
     * Removes each listener from the given station
     */
    Listeners.prototype.removeFrom = function (station) {
        var listeners = this.listeners;
        var stationMeta = station.stationMeta;
        for (var _i = 0, listeners_6 = listeners; _i < listeners_6.length; _i++) {
            var listener = listeners_6[_i];
            removeListener(stationMeta, listener, true);
        }
        return this;
    };
    /**
     * Moves the listeners to another station.
     * This method changes the origin station.
     */
    Listeners.prototype.moveTo = function (station) {
        this.removeFrom(this.originStation);
        this.originStation = station;
        this.addTo(station);
        return this;
    };
    /**
     * Determines whether any listener in the collection matches the given listener.
     * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
     */
    Listeners.prototype.has = function (matchingListener, exactMatch) {
        return matchListeners(matchingListener, this.listeners, exactMatch);
    };
    /**
     * Adds the listeners to the origin station
     */
    Listeners.prototype.attach = function () {
        return this.addTo(this.originStation);
    };
    /**
     * Removes the listeners from the origin station
     */
    Listeners.prototype.detach = function () {
        return this.removeFrom(this.originStation);
    };
    /**
     * Determines whether any of the listeners are attached to the given station.
     * If no station is given, the method determines whether any of the listeners
     * are attached to *any* station.
     */
    Listeners.prototype.isAttachedTo = function (station) {
        if (!station) {
            return isListenersAttached(this.listeners);
        }
        return hasListeners(station.stationMeta, this.listeners, true);
    };
    /**
     * Determines whether any of the listeners are attached to the origin station
     */
    Listeners.prototype.isAttached = function () {
        return this.isAttachedTo(this.originStation);
    };
    /**
     * Pauses each listener
     */
    Listeners.prototype.pause = function () {
        var listeners = this.listeners;
        for (var _i = 0, listeners_7 = listeners; _i < listeners_7.length; _i++) {
            var listener = listeners_7[_i];
            listener.isPaused = true;
        }
        return this;
    };
    /**
     * Un-pauses each listener
     */
    Listeners.prototype.resume = function () {
        var listeners = this.listeners;
        for (var _i = 0, listeners_8 = listeners; _i < listeners_8.length; _i++) {
            var listener = listeners_8[_i];
            listener.isPaused = false;
        }
        return this;
    };
    /**
     * Determines whether any of listeners are paused
     */
    Listeners.prototype.isPaused = function () {
        var listeners = this.listeners;
        for (var _i = 0, listeners_9 = listeners; _i < listeners_9.length; _i++) {
            var listener = listeners_9[_i];
            if (listener.isPaused)
                return true;
        }
        return false;
    };
    /**
     * @returns An iterable object (array) containing a promise
     * for each listener that resolves when said listener is applied.
     * This method is dependant on `Promise`.
     * @see inject()
     */
    Listeners.prototype.toPromises = function () {
        var promises = [];
        var listeners = this.listeners;
        for (var i = 0, c = listeners.length; i < c; i++) {
            var listener = listeners[i];
            promises[i] = makePromise(listener);
        }
        return promises;
    };
    /**
     * @returns A promise that resolves when all of the listeners
     * have been applied at least once.
     * This method is dependant on `Promise`.
     * @see inject()
     */
    Listeners.prototype.all = function () {
        return deps.$Promise.all(this.toPromises());
    };
    /**
     * @returns A promise that resolves when one of the listeners is applied.
     * This method is dependant on `Promise`.
     * @see inject()
     */
    Listeners.prototype.race = function () {
        return deps.$Promise.race(this.toPromises());
    };
    /**
     * Un-pauses each listener, and resets each listener's occurrence count
     */
    Listeners.prototype.reset = function () {
        var listeners = this.listeners;
        for (var _i = 0, listeners_10 = listeners; _i < listeners_10.length; _i++) {
            var listener = listeners_10[_i];
            listener.occurrences = undefined;
            listener.isPaused = undefined;
        }
        return this;
    };
    /** Similar to Array.prototype.forEach() */
    Listeners.prototype.forEach = function (func) {
        var listeners = this.listeners;
        for (var i = 0, c = listeners.length; i < c; i++) {
            var listener = listeners[i];
            func(listener, i, listeners);
        }
        return this;
    };
    /** Retrieves a listener located at the given index */
    Listeners.prototype.get = function (index) {
        return this.listeners[index];
    };
    /** Retrieves the index of the given listener */
    Listeners.prototype.index = function (listener) {
        var listeners = this.listeners;
        for (var i = 0, c = listeners.length; i < c; i++) {
            if (listener === listeners[i])
                return i;
        }
    };
    /**
     * @returns A new `Listeners` object containing a clone of each Listener
     */
    Listeners.prototype.clone = function () {
        var clonedListeners = this.listeners.map(cloneListener);
        return new Listeners(this.originStation, clonedListeners);
    };
    return Listeners;
}());
/** Creates a `Promise` and adds its `resolve` function to the listener's `resolves` array */
function makePromise(listener) {
    if (!deps.$Promise) {
        throw new Error('No promises implementation available.');
    }
    return new deps.$Promise(function (resolve) {
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
/** Determines whether the given listeners are attached to any stations */
function isListenersAttached(listeners) {
    for (var _i = 0, listeners_11 = listeners; _i < listeners_11.length; _i++) {
        var listener = listeners_11[_i];
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
    for (var _i = 0, listeners_12 = listeners; _i < listeners_12.length; _i++) {
        var listener = listeners_12[_i];
        if (hasListener(stationMeta, listener, exactMatch)) {
            return true;
        }
    }
    return false;
}

/** Iterator for generating unique station IDs */
var stationIdIterator = 0;
/** Generates a unique ID for EventStation instances */
function makeStationId() {
    return String(++stationIdIterator);
}

/** Container for global configuration options */
var defaultOptions = {
    delimiter: ' ',
    emitAllEvent: true,
    enableDelimiter: true,
    enableRegExp: false,
    regExpMarker: '%',
};
/** Container for global configuration options */
var globalOptions = mergeOptions({}, defaultOptions);
/** Resets the global configuration to defaults */
function reset$1() {
    mergeOptions(globalOptions, defaultOptions);
}
/** Modifies the default global configuration */
function config(opts) {
    var testOptions = mergeOptions({}, globalOptions, opts);
    assertOptions(testOptions);
    mergeOptions(globalOptions, opts);
}
/**
 * Validates the given options
 * @throws Error
 */
function assertOptions(opts) {
    if (opts.delimiter === '') {
        throw new Error("Invalid option: Delimiters can't be empty strings.");
    }
    if (opts.regExpMarker === '') {
        throw new Error("Invalid option: RegExp markers can't be empty strings.");
    }
    if (opts.regExpMarker && opts.delimiter && opts.regExpMarker.indexOf(opts.delimiter) >= 0) {
        throw new Error("Invalid option: RegExp markers can't contain the delimiter string.");
    }
}
function mergeOptions(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var option in defaultOptions) {
            var isValidOption = defaultOptions.hasOwnProperty(option);
            var value = source[option];
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
var EventStation$1 = (function () {
    function EventStation(options) {
        EventStation.init(this, options);
    }
    Object.defineProperty(EventStation.prototype, "stationId", {
        /** An ID unique to all stations */
        get: function () {
            return this.stationMeta.stationId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventStation.prototype, "listenerCount", {
        /** Number of listeners attached to the station */
        get: function () {
            return this.stationMeta.listenerCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventStation.prototype, "hearingCount", {
        /**
         * Number of listeners attached to other stations by the station.
         * This value is increased by using `hear()` and `hearOnce()`.
         */
        get: function () {
            return this.stationMeta.hearingCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventStation.prototype, "listenerEventNames", {
        /** Array of event names which have listeners on the station */
        get: function () {
            return Object.getOwnPropertyNames(this.stationMeta.listenersMap);
        },
        enumerable: true,
        configurable: true
    });
    EventStation.prototype.on = function (q, r, s) {
        var stationMeta = this.stationMeta;
        var listeners = makeListeners(this, false, q, r, s);
        for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
            var listener = listeners_1[_i];
            addListener(stationMeta, listener);
        }
        return new Listeners(this, listeners);
    };
    EventStation.prototype.once = function (q, r, s) {
        return this.on(q, r, s).occur(1);
    };
    EventStation.prototype.off = function (q, r, s) {
        var stationMeta = this.stationMeta;
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
        var listeners = makeListeners(this, true, q, r, s);
        for (var _i = 0, listeners_2 = listeners; _i < listeners_2.length; _i++) {
            var listener = listeners_2[_i];
            removeListener(stationMeta, listener);
        }
    };
    EventStation.prototype.hear = function (station, q, r, s) {
        var heardStations = this.stationMeta.heardStations;
        var listeners = makeListeners(this, false, q, r, s);
        var targetStationMeta = station.stationMeta;
        for (var _i = 0, listeners_3 = listeners; _i < listeners_3.length; _i++) {
            var listener = listeners_3[_i];
            listener.hearer = this;
            listener.crossOrigin = station;
            addListener(targetStationMeta, listener);
            heardStations[station.stationId] = station;
        }
        return new Listeners(station, listeners);
    };
    EventStation.prototype.hearOnce = function (station, q, r, s) {
        return this.hear(station, q, r, s).occur(1);
    };
    EventStation.prototype.disregard = function (target, q, r, s) {
        var stationMeta = this.stationMeta;
        if (stationMeta.hearingCount < 1)
            return;
        var isRemovingAll = false;
        var listeners = [];
        // If no listener targets were given
        if (q === undefined) {
            isRemovingAll = true;
        }
        else {
            listeners = makeListeners(this, true, q, r, s);
        }
        var stations = getTargetedStations(stationMeta, target);
        for (var x = 0, y = stations.length; x < y; x++) {
            var station = stations[x];
            var targetStationMeta = station.stationMeta;
            if (isRemovingAll) {
                q = station.listenerEventNames;
                listeners = makeListeners(this, true, q, r, s);
            }
            for (var _i = 0, listeners_4 = listeners; _i < listeners_4.length; _i++) {
                var listener = listeners_4[_i];
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
    };
    EventStation.prototype.isHeard = function (q, r, s) {
        var stationMeta = this.stationMeta;
        var listenerCount = stationMeta.listenerCount;
        if (listenerCount < 1)
            return false;
        if (arguments.length < 1) {
            // Determine if any listeners are attached
            return listenerCount > 0;
        }
        var listeners = makeListeners(this, true, q, r, s);
        for (var _i = 0, listeners_5 = listeners; _i < listeners_5.length; _i++) {
            var listener = listeners_5[_i];
            if (hasListener(stationMeta, listener))
                return true;
        }
        return false;
    };
    EventStation.prototype.isHearing = function (target, q, r, s) {
        var stationMeta = this.stationMeta;
        if (stationMeta.hearingCount < 1)
            return false;
        var stations = getTargetedStations(stationMeta, target);
        var matchAllListeners = false;
        var listeners = [];
        // If no listener targets were given
        if (q) {
            listeners = makeListeners(this, true, q, r, s);
        }
        else {
            matchAllListeners = true;
        }
        for (var x = 0, y = stations.length; x < y; x++) {
            var station = stations[x];
            var targetStationMeta = station.stationMeta;
            if (matchAllListeners) {
                q = station.listenerEventNames;
                listeners = makeListeners(this, true, q, r, s);
            }
            for (var _i = 0, listeners_6 = listeners; _i < listeners_6.length; _i++) {
                var listener = listeners_6[_i];
                listener.hearer = this;
                if (hasListener(targetStationMeta, listener))
                    return true;
            }
        }
        return false;
    };
    EventStation.prototype.emit = function (input) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var stationMeta = this.stationMeta;
        if (stationMeta.listenerCount < 1)
            return;
        var eventNames = parseEventNames(input, stationMeta);
        for (var _a = 0, eventNames_1 = eventNames; _a < eventNames_1.length; _a++) {
            var eventName = eventNames_1[_a];
            emitEvent(eventName, this, false, args);
        }
    };
    EventStation.prototype.emitAsync = function (input) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!deps.$Promise) {
            throw new Error('No promises implementation available.');
        }
        var stationMeta = this.stationMeta;
        if (stationMeta.listenerCount < 1) {
            return deps.$Promise.resolve([]);
        }
        var eventNames = parseEventNames(input, stationMeta);
        var promises = [];
        for (var _a = 0, eventNames_2 = eventNames; _a < eventNames_2.length; _a++) {
            var eventName = eventNames_2[_a];
            promises = promises.concat(emitEvent(eventName, this, true, args));
        }
        if (promises.length > 0) {
            return deps.$Promise.all(promises);
        }
        else {
            return deps.$Promise.resolve([]);
        }
    };
    EventStation.prototype.makeListeners = function (q, r, s) {
        var listeners = makeListeners(this, false, q, r, s);
        return new Listeners(this, listeners);
    };
    EventStation.prototype.getListeners = function (q, r, s) {
        var attachedListeners = getAllListeners(this.stationMeta);
        if (attachedListeners.length < 1) {
            return undefined;
        }
        if (arguments.length < 1) {
            return new Listeners(this, attachedListeners);
        }
        var matchingListeners = makeListeners(this, true, q, r, s);
        var listeners = [];
        for (var _i = 0, attachedListeners_1 = attachedListeners; _i < attachedListeners_1.length; _i++) {
            var attachedListener = attachedListeners_1[_i];
            for (var _a = 0, matchingListeners_1 = matchingListeners; _a < matchingListeners_1.length; _a++) {
                var matchingListener = matchingListeners_1[_a];
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
    };
    EventStation.prototype.toObservable = function (q, s, selector) {
        var _this = this;
        if (!deps.$RxObservable) {
            throw new Error('Rx has not been injected. See documentation for details.');
        }
        return deps.$RxObservable.fromEventPattern(function (r) {
            _this.on(q, r, s);
        }, function (r) {
            _this.off(q, r, s);
        }, selector);
    };
    /**
     * Stops the propagation of an emitted event. When called, this method effectively does
     * nothing if an event is not being emitted at the time.
     */
    EventStation.prototype.stopPropagation = function () {
        this.stationMeta.isPropagationStopped = true;
    };
    /**
     * Adds the given listener to the station
     */
    EventStation.prototype.addListener = function (listener) {
        addListener(this.stationMeta, listener);
    };
    /**
    * Removes all listeners that match the given listener from the station
    * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
    */
    EventStation.prototype.removeListener = function (listener, exactMatch) {
        removeListener(this.stationMeta, listener, exactMatch);
    };
    /**
    * Determines whether any listener attached to the station matches the given listener.
    * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
    */
    EventStation.prototype.hasListener = function (listener, exactMatch) {
        return hasListener(this.stationMeta, listener, exactMatch);
    };
    /** Initializes the given object */
    EventStation.init = function (obj, options) {
        obj.stationMeta = makeStationMeta(options);
        return EventStation;
    };
    EventStation.inject = function (name, obj) {
        inject(name, obj);
        return EventStation;
    };
    /** Modifies the global configuration */
    EventStation.config = function (opts) {
        config(opts);
        return EventStation;
    };
    /** Resets the global configuration and injected dependencies */
    EventStation.reset = function () {
        reset$1();
        reset();
        return EventStation;
    };
    /**
     * Extends an object with EventStation's public members
     */
    EventStation.extend = function (obj) {
        var proto = EventStation.prototype;
        for (var propertyName in proto) {
            var descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
            var newDescriptor = { configurable: true };
            if (descriptor.get !== undefined) {
                newDescriptor.get = descriptor.get;
            }
            else {
                newDescriptor.value = descriptor.value;
            }
            Object.defineProperty(obj, propertyName, newDescriptor);
        }
        return obj;
    };
    EventStation.make = function () {
        var station = EventStation.extend({});
        EventStation.init(station);
        return station;
    };
    return EventStation;
}());
function parseEventNames(input, options) {
    var names;
    if (typeof input === 'string') {
        var delimiter = options.delimiter;
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
        throw new Error("Invalid first argument");
    }
    return names;
}
/** Creates a new station meta object from the given configuration options */
function makeStationMeta(config$$1) {
    if (config$$1 === void 0) { config$$1 = {}; }
    var state = {
        heardStations: Object.create(null),
        hearingCount: 0,
        isPropagationStopped: false,
        listenerCount: 0,
        listenersMap: Object.create(null),
        stationId: makeStationId(),
    };
    var meta = mergeOptions(state, globalOptions, config$$1);
    assertOptions(meta);
    return meta;
}
function makeListeners(originStation, isMatching, q, r, s) {
    if (typeof q === 'string') {
        var stationMeta = originStation.stationMeta;
        var enableDelimiter = stationMeta.enableDelimiter;
        var delimiter = stationMeta.delimiter;
        if (enableDelimiter && q.indexOf(delimiter) >= 0) {
            q = q.split(delimiter);
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
function makeListenersFromMap(originStation, isMatching, listenerMap, context) {
    var listeners = [];
    for (var eventName in listenerMap) {
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
function makeListenersFromArray(originStation, isMatching, eventNames, callback, context) {
    var listeners = [];
    for (var i = 0, l = eventNames.length; i < l; i++) {
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
function emitEvent(eventName, originStation, enableAsync, args) {
    var stationMeta = originStation.stationMeta;
    var listenersMap = stationMeta.listenersMap;
    var listeners;
    if (stationMeta.enableRegExp) {
        listeners = searchListeners(eventName, listenersMap, stationMeta.regExpMarker);
    }
    else {
        listeners = listenersMap[eventName];
    }
    var promises = [];
    if (listeners) {
        var result = applyListeners(listeners, originStation, enableAsync, args);
        if (enableAsync && result) {
            promises = promises.concat(result);
        }
    }
    var listenersMapAll = listenersMap['all'];
    if (stationMeta.emitAllEvent && listenersMapAll) {
        var argsAll = args.slice();
        argsAll.splice(0, 0, eventName);
        var result = applyListeners(listenersMapAll, originStation, enableAsync, argsAll);
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
    var listeners = [];
    for (var expression in listenersMap) {
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
    var stationMap = Object.create(null);
    var heardStations = station.stationMeta.heardStations;
    for (var stationId in heardStations) {
        var heardStation = heardStations[stationId];
        if (hasListener(heardStation.stationMeta, { hearer: station })) {
            stationMap[stationId] = heardStation;
        }
    }
    station.stationMeta.heardStations = stationMap;
}
/** Removes all listeners from then given station meta */
function removeAllListeners(stationMeta) {
    var listenersMap = stationMeta.listenersMap;
    for (var eventName in listenersMap) {
        var listeners = listenersMap[eventName];
        for (var _i = 0, listeners_7 = listeners; _i < listeners_7.length; _i++) {
            var listener = listeners_7[_i];
            var hearer = listener.hearer;
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
    var listenersMap = stationMeta.listenersMap;
    var listeners = listenersMap[eventName];
    if (listeners === undefined)
        return;
    var count = listeners.length;
    for (var i = 0; i < count; i++) {
        var listener = listeners[i];
        var hearer = listener.hearer;
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
    throw new Error("Invalid target");
}
/**
 * @returns the heard stations of a given station's meta as an array
 */
function getHeardStations(stationMeta) {
    var stations = [];
    var heardStations = stationMeta.heardStations;
    for (var stationId in heardStations) {
        stations.push(heardStations[stationId]);
    }
    return stations;
}

return EventStation$1;

})));
//# sourceMappingURL=event-station.js.map
