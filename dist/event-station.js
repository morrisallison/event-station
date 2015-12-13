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
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
    else if (typeof self === "object") {
        self.EventStation = factory();
    }
})(function (require, exports) {
    'use strict';
    /**
     * Event emitter class and namespace
     */
    var EventStation = (function () {
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
            for (var i = 0, c = listeners.length; i < c; i++) {
                addListener(stationMeta, listeners[i]);
            }
            return new EventStation.Listeners(this, listeners);
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
            for (var i = 0, c = listeners.length; i < c; i++) {
                removeListener(stationMeta, listeners[i]);
            }
        };
        EventStation.prototype.hear = function (station, q, r, s) {
            var heardStations = this.stationMeta.heardStations;
            var listeners = makeListeners(this, false, q, r, s);
            var targetStationMeta = station.stationMeta;
            for (var i = 0, c = listeners.length; i < c; i++) {
                var listener = listeners[i];
                listener.hearer = this;
                listener.crossOrigin = station;
                addListener(targetStationMeta, listener);
                heardStations[station.stationId] = station;
            }
            return new EventStation.Listeners(station, listeners);
        };
        EventStation.prototype.hearOnce = function (station, q, r, s) {
            return this.hear(station, q, r, s).occur(1);
        };
        EventStation.prototype.disregard = function (target, q, r, s) {
            var stationMeta = this.stationMeta;
            if (stationMeta.hearingCount < 1)
                return;
            var isRemovingAll = false;
            var listeners;
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
                for (var i = 0, c = listeners.length; i < c; i++) {
                    var listener = listeners[i];
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
            for (var i = 0, c = listeners.length; i < c; i++) {
                if (hasListener(stationMeta, listeners[i]))
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
            var listeners;
            // If no listener targets were given
            if (q === undefined) {
                matchAllListeners = true;
            }
            else {
                listeners = makeListeners(this, true, q, r, s);
            }
            for (var x = 0, y = stations.length; x < y; x++) {
                var station = stations[x];
                var targetStationMeta = station.stationMeta;
                if (matchAllListeners) {
                    q = station.listenerEventNames;
                    listeners = makeListeners(this, true, q, r, s);
                }
                for (var i = 0, c = listeners.length; i < c; i++) {
                    var listener = listeners[i];
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
            for (var i = 0, c = eventNames.length; i < c; i++) {
                emitEvent(eventNames[i], this, false, args);
            }
        };
        EventStation.prototype.emitAsync = function (input) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if ($Promise === undefined) {
                throw new Error('No promises implementation available.');
            }
            var stationMeta = this.stationMeta;
            if (stationMeta.listenerCount < 1) {
                return $Promise.resolve();
            }
            var eventNames = parseEventNames(input, stationMeta);
            var promises = [];
            for (var i = 0, c = eventNames.length; i < c; i++) {
                promises = promises.concat(emitEvent(eventNames[i], this, true, args));
            }
            if (promises.length > 0) {
                return $Promise.all(promises);
            }
            else {
                return $Promise.resolve();
            }
        };
        EventStation.prototype.makeListeners = function (q, r, s) {
            var listeners = makeListeners(this, false, q, r, s);
            return new EventStation.Listeners(this, listeners);
        };
        EventStation.prototype.getListeners = function (q, r, s) {
            var attachedListeners = getAllListeners(this.stationMeta);
            var attachedCount = attachedListeners.length;
            if (attachedCount < 1) {
                return undefined;
            }
            if (arguments.length < 1) {
                return new EventStation.Listeners(this, attachedListeners);
            }
            var matchingListeners = makeListeners(this, true, q, r, s);
            var listeners = [];
            for (var i = 0; i < attachedCount; i++) {
                var attachedListener = attachedListeners[i];
                for (var i_1 = 0, c = matchingListeners.length; i_1 < c; i_1++) {
                    var matchingListener = matchingListeners[i_1];
                    if (matchListener(matchingListener, attachedListener)) {
                        listeners.push(attachedListener);
                        break;
                    }
                }
            }
            // No matching listeners were found
            if (listeners.length < 1)
                return undefined;
            return new EventStation.Listeners(this, listeners);
        };
        EventStation.prototype.toObservable = function (q, s, selector) {
            var _this = this;
            if ($RxObservable === undefined) {
                throw new Error('Rx has not been injected. See documentation for details.');
            }
            return $RxObservable.fromEventPattern(function (r) {
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
        return EventStation;
    })();
    var EventStation;
    (function (EventStation) {
        /** Initializes the given object */
        function init(obj, options) {
            obj.stationMeta = makeStationMeta(options);
        }
        EventStation.init = init;
        /** Changes the default global configuration */
        function config(options) {
            for (var optionName in globalOptions) {
                globalOptions[optionName] = options[optionName];
            }
            return EventStation;
        }
        EventStation.config = config;
        function inject(name, obj) {
            if (name === 'rx') {
                $RxObservable = obj.Observable;
            }
            else if (name === 'Promise') {
                $Promise = obj;
            }
            else {
                throw new Error('Invalid name');
            }
            return EventStation;
        }
        EventStation.inject = inject;
        /**
         * Extends an object with EventStation's public members
         */
        function extend(obj) {
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
        }
        EventStation.extend = extend;
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
                for (var i = 0, c = listeners.length; i < c; i++) {
                    listeners[i].maxOccurrences = maxOccurrences;
                }
                return this;
            };
            /**
             * Sets each listener's callback function
             */
            Listeners.prototype.calling = function (callback) {
                var listeners = this.listeners;
                for (var i = 0, c = listeners.length; i < c; i++) {
                    var listener = listeners[i];
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
                for (var i = 0, c = listeners.length; i < c; i++) {
                    removeListenerFromAll(listeners[i]);
                }
                return this;
            };
            /**
             * Sets the context of each listener
             */
            Listeners.prototype.using = function (context) {
                var listeners = this.listeners;
                for (var i = 0, c = listeners.length; i < c; i++) {
                    var listener = listeners[i];
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
                for (var i = 0, c = listeners.length; i < c; i++) {
                    var listener = listeners[i];
                    var crossOrigin = listener.crossOrigin;
                    if (crossOrigin !== undefined && crossOrigin !== station) {
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
                for (var i = 0, c = listeners.length; i < c; i++) {
                    removeListener(stationMeta, listeners[i], true);
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
                if (station === undefined) {
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
                for (var i = 0, c = listeners.length; i < c; i++) {
                    listeners[i].isPaused = true;
                }
                return this;
            };
            /**
             * Un-pauses each listener
             */
            Listeners.prototype.resume = function () {
                var listeners = this.listeners;
                for (var i = 0, c = listeners.length; i < c; i++) {
                    listeners[i].isPaused = false;
                }
                return this;
            };
            /**
             * Determines whether any of listeners are paused
             */
            Listeners.prototype.isPaused = function () {
                var listeners = this.listeners;
                for (var i = 0, c = listeners.length; i < c; i++) {
                    if (listeners[i].isPaused)
                        return true;
                }
                return false;
            };
            /**
             * @returns An iterable object (array) containing a promise
             * for each listener that resolves when said listener is applied.
             * This method is dependant on `Promise`.
             * @see EventStation.inject()
             */
            Listeners.prototype.toPromises = function () {
                var promises = [];
                var listeners = this.listeners;
                for (var i = 0, c = listeners.length; i < c; i++) {
                    promises[i] = makePromise(listeners[i]);
                }
                return promises;
            };
            /**
             * @returns A promise that resolves when all of the listeners
             * have been applied at least once.
             * This method is dependant on `Promise`.
             * @see EventStation.inject()
             */
            Listeners.prototype.all = function () {
                return $Promise.all(this.toPromises());
            };
            /**
             * @returns A promise that resolves when one of the listeners is applied.
             * This method is dependant on `Promise`.
             * @see EventStation.inject()
             */
            Listeners.prototype.race = function () {
                return $Promise.race(this.toPromises());
            };
            /**
             * Un-pauses each listener, and resets each listener's occurrence count
             */
            Listeners.prototype.reset = function () {
                var listeners = this.listeners;
                for (var i = 0, c = listeners.length; i < c; i++) {
                    var listener = listeners[i];
                    listener.occurrences = undefined;
                    listener.isPaused = undefined;
                }
                return this;
            };
            /** Similar to Array.prototype.forEach() */
            Listeners.prototype.forEach = function (func) {
                var listeners = this.listeners;
                for (var i = 0, c = listeners.length; i < c; i++) {
                    func(listeners[i], i, listeners);
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
                    if (listeners[i] === listener)
                        return i;
                }
                return undefined;
            };
            /**
             * @returns A new `Listeners` object containing a clone of each Listener
             * The new object will not have an `originStation`.
             */
            Listeners.prototype.clone = function () {
                var clonedListeners = [];
                var listeners = this.listeners;
                for (var i = 0, c = listeners.length; i < c; i++) {
                    clonedListeners[i] = cloneListener(listeners[i]);
                }
                return new Listeners(this.originStation, clonedListeners);
            };
            return Listeners;
        })();
        EventStation.Listeners = Listeners;
    })(EventStation || (EventStation = {}));
    /** Iterator for generating unique station IDs */
    var stationIdIterator = 0;
    /** Container for global configuration options */
    var globalOptions = Object.create(null);
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
    var $RxObservable;
    /**
     * A reference to the Promise object, or an injected Promise-like object.
     * @see EventStation.inject()
     */
    var $Promise = Promise;
    /** Generates a unique ID for EventStation instances */
    function makeStationId() {
        return String(++stationIdIterator);
    }
    /** Creates a new station meta object from the given configuration options */
    function makeStationMeta(opts) {
        if (opts === void 0) { opts = {}; }
        var glob = globalOptions;
        var undef;
        return {
            stationId: makeStationId(),
            listenerCount: 0,
            hearingCount: 0,
            listenersMap: Object.create(null),
            heardStations: Object.create(null),
            isPropagationStopped: false,
            emitAllEvent: opts.emitAllEvent === undef ? glob.emitAllEvent : opts.emitAllEvent,
            enableRegExp: opts.enableRegExp === undef ? glob.enableRegExp : opts.enableRegExp,
            regExpMarker: opts.regExpMarker === undef ? glob.regExpMarker : opts.regExpMarker,
            enableDelimiter: opts.enableDelimiter === undef ? glob.enableDelimiter : opts.enableDelimiter,
            delimiter: opts.delimiter === undef ? glob.delimiter : opts.delimiter,
        };
    }
    /** Adds the given listener to the given station meta */
    function addListener(stationMeta, listener) {
        var eventName = listener.eventName;
        var listenersMap = stationMeta.listenersMap;
        if (listenersMap[eventName] === undefined) {
            listenersMap[eventName] = [];
        }
        var stationMetas = listener.stationMetas;
        if (stationMetas === undefined) {
            listener.stationMetas = [stationMeta];
        }
        else {
            stationMetas.push(stationMeta);
        }
        listenersMap[eventName].push(listener);
        stationMeta.listenerCount++;
        var hearer = listener.hearer;
        if (hearer !== undefined) {
            hearer.stationMeta.hearingCount++;
        }
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
        if (attachedListeners === undefined)
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
    function hasListener(stationMeta, listener, exactMatch) {
        var listenersMap = stationMeta.listenersMap;
        var eventName = listener.eventName;
        var attachedListeners;
        if (eventName === undefined) {
            attachedListeners = getAllListeners(stationMeta);
        }
        else {
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
    function hasListeners(stationMeta, listeners, exactMatch) {
        for (var i = 0, c = listeners.length; i < c; i++) {
            if (hasListener(stationMeta, listeners[i], exactMatch)) {
                return true;
            }
        }
        return false;
    }
    /** Determines whether the given listener is attached to any stations */
    function isListenerAttached(listener) {
        return listener.stationMetas !== undefined;
    }
    /** Determines whether the given listeners are attached to any stations */
    function isListenersAttached(listeners) {
        for (var i = 0, c = listeners.length; i < c; i++) {
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
    function matchListener(matchingListener, attachedListener, exactMatch) {
        if (exactMatch === true) {
            return matchingListener === attachedListener;
        }
        var matchCallback = matchingListener.matchCallback;
        if (matchCallback !== undefined
            && matchCallback !== attachedListener.matchCallback) {
            return false;
        }
        var matchContext = matchingListener.matchContext;
        if (matchContext !== undefined
            && matchContext !== attachedListener.matchContext) {
            return false;
        }
        var hearer = matchingListener.hearer;
        if (hearer !== undefined
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
    function matchListeners(matchingListener, attachedListeners, exactMatch) {
        var count = attachedListeners.length;
        if (count < 1)
            return false;
        for (var i = 0; i < count; i++) {
            var attachedListener = attachedListeners[i];
            if (matchListener(matchingListener, attachedListener, exactMatch)) {
                return true;
            }
        }
        return false;
    }
    /** Applies the given listeners with the given arguments */
    function applyListeners(listeners, originStation, enableAsync, args) {
        var argsLength = args.length;
        var stationMeta = originStation.stationMeta;
        stationMeta.isPropagationStopped = false;
        var promises;
        if (enableAsync)
            promises = [];
        var result;
        for (var i = 0, c = listeners.length; i < c; i++) {
            if (stationMeta.isPropagationStopped) {
                stationMeta.isPropagationStopped = false;
                return;
            }
            var listener = listeners[i];
            if (listener.isPaused)
                continue;
            var callback = listener.callback;
            var context = listener.context;
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
            if (enableAsync
                && result !== undefined
                && typeof result.then === 'function'
                && typeof result.catch === 'function') {
                promises.push(result);
            }
            var resolves = listener.resolves;
            if (resolves !== undefined) {
                for (var i_2 = 0, c_1 = resolves.length; i_2 < c_1; i_2++) {
                    resolves[i_2](listener);
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
    /** Creates a `Promise` and adds its `resolve` function to the listener's `resolves` array */
    function makePromise(listener) {
        if ($Promise === undefined) {
            throw new Error('No promises implementation available.');
        }
        return new $Promise(function (resolve) {
            if (listener.resolves === undefined) {
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
        if (target.stationMeta !== undefined) {
            return [target];
        }
        throw new Error("Invalid target");
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
    /**
     * Retrieves listeners from the given listener map
     * that match the given event name. Specifically,
     * this function recognizes regular expression listeners.
     */
    function searchListeners(eventName, listenersMap, regExpMarker) {
        var listeners = [];
        for (var expression in listenersMap) {
            if (expression.indexOf(regExpMarker) === 0) {
                if (new RegExp(expression.substr(1)).test(eventName)) {
                    listeners = listeners.concat(listenersMap[expression]);
                }
            }
            else if (expression === eventName) {
                listeners = listeners.concat(listenersMap[eventName]);
            }
        }
        return listeners;
    }
    /** Removes the given listener from all of the station meta it's attached to */
    function removeListenerFromAll(listener) {
        var stationMetas = listener.stationMetas;
        for (var i = 0, c = stationMetas.length; i < c; i++) {
            removeListener(stationMetas[i], listener, true);
        }
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
            if (hearer !== undefined) {
                hearer.stationMeta.hearingCount--;
            }
        }
        stationMeta.listenerCount = stationMeta.listenerCount - count;
        delete listenersMap[eventName];
    }
    /** Removes all listeners from then given station meta */
    function removeAllListeners(stationMeta) {
        var listenersMap = stationMeta.listenersMap;
        for (var eventName in listenersMap) {
            var listeners = listenersMap[eventName];
            for (var i = 0, c = listeners.length; i < c; i++) {
                var listener = listeners[i];
                var hearer = listener.hearer;
                if (hearer !== undefined) {
                    hearer.stationMeta.hearingCount--;
                }
            }
        }
        stationMeta.listenerCount = 0;
        stationMeta.listenersMap = Object.create(null);
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
    function reduceHearerHearingCount(listener) {
        /*
         * Update the hearingCount of given listener's hearer
         */
        var hearer = listener.hearer;
        if (hearer !== undefined) {
            hearer.stationMeta.hearingCount--;
        }
    }
    function removeMetaFromStation(targetMeta, listener) {
        var stationMetas = listener.stationMetas;
        if (stationMetas === undefined)
            return;
        var stationMetasCount = stationMetas.length;
        if (stationMetasCount === 1) {
            if (stationMetas[0] === targetMeta) {
                listener.stationMetas = undefined;
            }
            return;
        }
        var newStationMetas = [];
        for (var i = 0; i < stationMetasCount; i++) {
            var stationMeta = stationMetas[i];
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
    function parseEventNames(input, options) {
        if (options === void 0) { options = {}; }
        var names;
        if (typeof input === 'string') {
            var delimiter = options.delimiter;
            if (options.enableDelimiter && input.indexOf(delimiter) >= 0) {
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
        var promises;
        if (enableAsync)
            promises = [];
        if (listeners !== undefined) {
            var result = applyListeners(listeners, originStation, enableAsync, args);
            if (enableAsync && result !== undefined) {
                promises = promises.concat(result);
            }
        }
        var listenersAll;
        if (stationMeta.emitAllEvent) {
            listenersAll = listenersMap.all;
        }
        if (listenersAll !== undefined) {
            var argsAll = args.slice();
            argsAll.splice(0, 0, eventName);
            var result = applyListeners(listenersAll, originStation, enableAsync, argsAll);
            if (enableAsync && result !== undefined) {
                promises = promises.concat(result);
            }
        }
        return promises;
    }
    return EventStation;
});
