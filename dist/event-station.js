/*
 * event-station v2.0.0
 * Copyright (c) 2016-2025 Morris Allison III <author@morris.xyz> (http://morris.xyz). All rights reserved.
 * Released under the MIT license
 * @preserve
 */
// lib/actions/addListener.js
function addListener(stationMeta, listener) {
  const eventName = listener.eventName;
  const listenersMap = stationMeta.listenersMap;
  if (!listenersMap[eventName]) {
    listenersMap[eventName] = [];
  }
  const stationMetas = listener.stationMetas;
  if (!stationMetas) {
    listener.stationMetas = [stationMeta];
  } else {
    stationMetas.push(stationMeta);
  }
  listenersMap[eventName].push(listener);
  stationMeta.listenerCount++;
  const hearer = listener.hearer;
  if (hearer) {
    hearer.stationMeta.hearingCount++;
  }
}

// lib/actions/matchListener.js
function matchListener(matchingListener, attachedListener, exactMatch) {
  if (exactMatch === true) {
    return matchingListener === attachedListener;
  }
  const matchCallback = matchingListener.matchCallback;
  if (matchCallback && matchCallback !== attachedListener.matchCallback) {
    return false;
  }
  const matchContext = matchingListener.matchContext;
  if (matchContext !== undefined && matchContext !== attachedListener.matchContext) {
    return false;
  }
  const hearer = matchingListener.hearer;
  if (hearer && hearer !== attachedListener.hearer) {
    return false;
  }
  const eventName = matchingListener.eventName;
  if (eventName !== undefined && eventName !== attachedListener.eventName) {
    return false;
  }
  return true;
}

// lib/actions/removeListener.js
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
  for (let i = 0, c = attachedListenersCount;i < c; i++) {
    const attachedListener = attachedListeners[i];
    if (!matchListener(listener, attachedListener, exactMatch))
      continue;
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
    listener.stationMetas = undefined;
  } else {
    listener.stationMetas = newStationMetas;
  }
}
function reduceHearerHearingCount(listener) {
  const hearer = listener.hearer;
  if (hearer) {
    hearer.stationMeta.hearingCount--;
  }
}

// lib/actions/removeListenerFromAll.js
function removeListenerFromAll(listener) {
  const stationMetas = listener.stationMetas;
  if (!stationMetas)
    return;
  for (const stationMeta of stationMetas) {
    removeListener(stationMeta, listener, true);
  }
}

// lib/actions/applyListeners.js
function applyListeners(_listeners, originStation, enableAsync, args) {
  const argsLength = args.length;
  const stationMeta = originStation.stationMeta;
  stationMeta.isPropagationStopped = false;
  const results = [];
  const listeners = _listeners.slice();
  for (const listener of listeners) {
    let result;
    if (stationMeta.isPropagationStopped) {
      stationMeta.isPropagationStopped = false;
      return results;
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
      results.push(result);
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
  return results;
}

// lib/actions/getAllListeners.js
function getAllListeners(stationMeta) {
  if (stationMeta.listenerCount < 1)
    return [];
  const listenersMap = stationMeta.listenersMap;
  let listeners = [];
  for (const eventName in listenersMap) {
    listeners = listeners.concat(listenersMap[eventName]);
  }
  return listeners;
}

// lib/actions/matchListeners.js
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

// lib/actions/hasListener.js
function hasListener(stationMeta, listener, exactMatch) {
  const listenersMap = stationMeta.listenersMap;
  const eventName = listener.eventName;
  let attachedListeners;
  if (eventName === undefined) {
    attachedListeners = getAllListeners(stationMeta);
  } else {
    attachedListeners = listenersMap[eventName];
    if (!attachedListeners) {
      return false;
    }
  }
  return matchListeners(listener, attachedListeners, exactMatch);
}

// lib/models/Listeners.js
class Listeners {
  get count() {
    return this.listeners.length;
  }
  originStation;
  listeners;
  constructor(originStation, listeners) {
    this.originStation = originStation;
    this.listeners = listeners;
  }
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
  calling(callback) {
    const listeners = this.listeners;
    for (const listener of listeners) {
      listener.callback = callback;
      listener.matchCallback = callback;
    }
    return this;
  }
  once(callback) {
    return this.calling(callback).occur(1);
  }
  off() {
    const listeners = this.listeners;
    for (const listener of listeners) {
      removeListenerFromAll(listener);
    }
    return this;
  }
  using(context) {
    const listeners = this.listeners;
    for (const listener of listeners) {
      listener.context = context;
      listener.matchContext = context;
    }
    return this;
  }
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
  removeFrom(station) {
    const listeners = this.listeners;
    const stationMeta = station.stationMeta;
    for (const listener of listeners) {
      removeListener(stationMeta, listener, true);
    }
    return this;
  }
  moveTo(station) {
    this.removeFrom(this.originStation);
    this.originStation = station;
    this.addTo(station);
    return this;
  }
  has(matchingListener, exactMatch) {
    return matchListeners(matchingListener, this.listeners, exactMatch);
  }
  attach() {
    return this.addTo(this.originStation);
  }
  detach() {
    return this.removeFrom(this.originStation);
  }
  isAttachedTo(station) {
    if (!station) {
      return isListenersAttached(this.listeners);
    }
    return hasListeners(station.stationMeta, this.listeners, true);
  }
  isAttached() {
    return this.isAttachedTo(this.originStation);
  }
  pause() {
    const listeners = this.listeners;
    for (const listener of listeners) {
      listener.isPaused = true;
    }
    return this;
  }
  resume() {
    const listeners = this.listeners;
    for (const listener of listeners) {
      listener.isPaused = false;
    }
    return this;
  }
  isPaused() {
    const listeners = this.listeners;
    for (const listener of listeners) {
      if (listener.isPaused)
        return true;
    }
    return false;
  }
  toPromises() {
    const promises = [];
    const listeners = this.listeners;
    const count = listeners.length;
    for (let i = 0;i < count; i++) {
      const listener = listeners[i];
      promises[i] = makePromise(listener);
    }
    return promises;
  }
  all() {
    return Promise.all(this.toPromises());
  }
  race() {
    return Promise.race(this.toPromises());
  }
  reset() {
    const listeners = this.listeners;
    for (const listener of listeners) {
      listener.occurrences = undefined;
      listener.isPaused = undefined;
    }
    return this;
  }
  forEach(func) {
    const listeners = this.listeners;
    const count = listeners.length;
    for (let i = 0;i < count; i++) {
      const listener = listeners[i];
      func(listener, i, listeners);
    }
    return this;
  }
  get(index) {
    return this.listeners[index];
  }
  index(listener) {
    const listeners = this.listeners;
    const count = listeners.length;
    for (let i = 0;i < count; i++) {
      if (listener === listeners[i])
        return i;
    }
    return;
  }
  clone() {
    const clonedListeners = this.listeners.map(cloneListener);
    return new Listeners(this.originStation, clonedListeners);
  }
}
function makePromise(listener) {
  return new Promise((resolve) => {
    if (!listener.resolves) {
      listener.resolves = [resolve];
    } else {
      listener.resolves.push(resolve);
    }
  });
}
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
    maxOccurrences: listener.maxOccurrences
  };
}
function isListenersAttached(listeners) {
  for (const listener of listeners) {
    if (isListenerAttached(listener)) {
      return true;
    }
  }
  return false;
}
function isListenerAttached(listener) {
  return listener.stationMetas !== undefined;
}
function hasListeners(stationMeta, listeners, exactMatch) {
  for (const listener of listeners) {
    if (hasListener(stationMeta, listener, exactMatch)) {
      return true;
    }
  }
  return false;
}

// lib/actions/makeStationId.js
var stationIdIterator = 0;
function makeStationId() {
  return String(++stationIdIterator);
}

// lib/config.js
var ALL_EVENT_NAME = "all";
var defaultOptions = {
  delimiter: " ",
  emitAllEvent: true,
  enableDelimiter: true,
  enableRegExp: false,
  regExpMarker: "%"
};
var globalOptions = mergeOptions({}, defaultOptions);
function reset() {
  mergeOptions(globalOptions, defaultOptions);
}
function config(opts) {
  const testOptions = mergeOptions({}, globalOptions, opts);
  assertOptions(testOptions);
  mergeOptions(globalOptions, opts);
}
function assertOptions(opts) {
  if (opts.delimiter === "") {
    throw new Error(`Invalid option: Delimiters can't be empty strings.`);
  }
  if (opts.regExpMarker === "") {
    throw new Error(`Invalid option: RegExp markers can't be empty strings.`);
  }
  if (opts.regExpMarker && opts.delimiter && opts.regExpMarker.indexOf(opts.delimiter) >= 0) {
    throw new Error(`Invalid option: RegExp markers can't contain the delimiter string.`);
  }
}
function mergeOptions(target) {
  for (let i = 1;i < arguments.length; i++) {
    const source = arguments[i];
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

// lib/models/EventStation.js
class EventStation {
  stationMeta;
  constructor(options) {
    EventStation.init(this, options);
  }
  get stationId() {
    return this.stationMeta.stationId;
  }
  get listenerCount() {
    return this.stationMeta.listenerCount;
  }
  get hearingCount() {
    return this.stationMeta.hearingCount;
  }
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
    if (q === undefined) {
      removeAllListeners(stationMeta);
      return;
    }
    if (r === undefined && s === undefined && typeof q === "string" && (!stationMeta.enableDelimiter || q.indexOf(stationMeta.delimiter) < 0)) {
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
    if (q === undefined) {
      isRemovingAll = true;
    } else {
      listeners = makeListeners(this, true, q, r, s);
    }
    const stations = getTargetedStations(stationMeta, target);
    const count = stations.length;
    for (let x = 0;x < count; x++) {
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
  isHeard(q, r, s) {
    const stationMeta = this.stationMeta;
    const listenerCount = stationMeta.listenerCount;
    if (listenerCount < 1)
      return false;
    if (arguments.length < 1) {
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
    if (q) {
      listeners = makeListeners(this, true, q, r, s);
    } else {
      matchAllListeners = true;
    }
    const count = stations.length;
    for (let x = 0;x < count; x++) {
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
    if (stationMeta.listenerCount < 1) {
      return [];
    }
    const eventNames = parseEventNames(input, stationMeta);
    let results = [];
    for (const eventName of eventNames) {
      results = results.concat(emitEvent(eventName, this, false, args));
    }
    return results;
  }
  async emitAsync(input, ...args) {
    const results = this.emit(input, ...args);
    if (results.length === 0) {
      return [];
    }
    return Promise.all(results);
  }
  makeListeners(q, r, s) {
    const listeners = makeListeners(this, false, q, r, s);
    return new Listeners(this, listeners);
  }
  getListeners(q, r, s) {
    const attachedListeners = getAllListeners(this.stationMeta);
    if (attachedListeners.length < 1) {
      return;
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
    if (listeners.length < 1)
      return;
    return new Listeners(this, listeners);
  }
  stopPropagation() {
    this.stationMeta.isPropagationStopped = true;
  }
  addListener(listener) {
    addListener(this.stationMeta, listener);
  }
  removeListener(listener, exactMatch) {
    removeListener(this.stationMeta, listener, exactMatch);
  }
  hasListener(listener, exactMatch) {
    return hasListener(this.stationMeta, listener, exactMatch);
  }
  static init(obj, options) {
    obj.stationMeta = makeStationMeta(options);
    return EventStation;
  }
  static config(opts) {
    config(opts);
    return EventStation;
  }
  static reset() {
    reset();
    return EventStation;
  }
  static create(options) {
    return new EventStation(options);
  }
}
function parseEventNames(input, options) {
  let names;
  if (typeof input === "string") {
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
function makeStationMeta(options = {}) {
  const state = {
    heardStations: Object.create(null),
    hearingCount: 0,
    isPropagationStopped: false,
    listenerCount: 0,
    listenersMap: Object.create(null),
    stationId: makeStationId()
  };
  const meta = mergeOptions(state, globalOptions, options);
  assertOptions(meta);
  return meta;
}
function makeListeners(origin, isMatching, q, r, s) {
  if (typeof q === "string") {
    const stationMeta = origin.stationMeta;
    const enableDelimiter = stationMeta.enableDelimiter;
    const delimiter = stationMeta.delimiter;
    if (enableDelimiter && q.indexOf(delimiter) >= 0) {
      const _q = q.split(delimiter);
      return makeListenersFromArray(origin, isMatching, _q, r, s);
    }
    return [
      {
        eventName: q,
        callback: r,
        context: !isMatching && s === undefined ? origin : s,
        matchCallback: r,
        matchContext: s
      }
    ];
  }
  if (Array.isArray(q)) {
    return makeListenersFromArray(origin, isMatching, q, r, s);
  }
  if (typeof q === "object") {
    return makeListenersFromMap(origin, isMatching, q, r);
  }
  throw new Error(`Invalid arguments`);
}
function makeListenersFromMap(originStation, isMatching, listenerMap, context) {
  const listeners = [];
  const eventNames = Object.getOwnPropertyNames(listenerMap);
  for (const eventName of eventNames) {
    listeners.push({
      eventName,
      callback: listenerMap[eventName],
      context: !isMatching && context === undefined ? originStation : context,
      matchCallback: listenerMap[eventName],
      matchContext: context
    });
  }
  return listeners;
}
function makeListenersFromArray(origin, isMatching, eventNames, callback, context) {
  const listeners = [];
  const count = eventNames.length;
  for (let i = 0;i < count; i++) {
    listeners.push({
      eventName: eventNames[i],
      callback,
      context: !isMatching && context === undefined ? origin : context,
      matchContext: context,
      matchCallback: callback
    });
  }
  return listeners;
}
function emitEvent(eventName, originStation, enableAsync, args) {
  const stationMeta = originStation.stationMeta;
  const listenersMap = stationMeta.listenersMap;
  let listeners = undefined;
  if (stationMeta.enableRegExp) {
    listeners = searchListeners(eventName, listenersMap, stationMeta.regExpMarker);
  } else {
    listeners = listenersMap[eventName];
  }
  let results = [];
  if (listeners) {
    results = [
      ...results,
      ...applyListeners(listeners, originStation, enableAsync, args)
    ];
  }
  const listenersMapAll = listenersMap[ALL_EVENT_NAME];
  if (stationMeta.emitAllEvent && listenersMapAll) {
    const argsAll = args.slice();
    argsAll.splice(0, 0, eventName);
    results = [
      ...results,
      ...applyListeners(listenersMapAll, originStation, enableAsync, argsAll)
    ];
  }
  return results;
}
function searchListeners(eventName, listenersMap, regExpMarker) {
  let listeners = [];
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
function cleanHeardStations(station) {
  const stationMap = Object.create(null);
  const heardStations = station.stationMeta.heardStations;
  for (const stationId in heardStations) {
    const heardStation = heardStations[stationId];
    if (hasListener(heardStation.stationMeta, { hearer: station })) {
      stationMap[stationId] = heardStation;
    }
  }
  station.stationMeta.heardStations = stationMap;
}
function removeAllListeners(stationMeta) {
  const listenersMap = stationMeta.listenersMap;
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
function removeListeners(eventName, stationMeta) {
  const listenersMap = stationMeta.listenersMap;
  const listeners = listenersMap[eventName];
  if (listeners === undefined)
    return;
  const count = listeners.length;
  for (let i = 0;i < count; i++) {
    const listener = listeners[i];
    const hearer = listener.hearer;
    if (hearer) {
      hearer.stationMeta.hearingCount--;
    }
  }
  stationMeta.listenerCount = stationMeta.listenerCount - count;
  delete listenersMap[eventName];
}
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
function getHeardStations(stationMeta) {
  const stations = [];
  const heardStations = stationMeta.heardStations;
  for (const stationId in heardStations) {
    stations.push(heardStations[stationId]);
  }
  return stations;
}
export {
  EventStation
};
