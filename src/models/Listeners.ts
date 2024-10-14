import { addListener } from "../actions/addListener";
import { deps } from "../injector";
import { Emitter } from "../types/Emitter";
import { hasListener } from "../actions/hasListener";
import { Listener } from "../types/Listener";
import { MatchingListener } from "../types/MatchingListener";
import { matchListeners } from "../actions/matchListeners";
import { Meta } from "../types/Meta";
import { removeListener } from "../actions/removeListener";
import { removeListenerFromAll } from "../actions/removeListenerFromAll";

const errors = {
  NO_PROMISE: "No promises implementation available.",
};

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
      throw new Error(
        `The maximum occurrences must be greater than or equal to one.`
      );
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
  public calling(callback: Function): Listeners {
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
  public once(callback: Function): Listeners {
    return this.calling(callback).occur(1);
  }

  /**
   * Removes the listeners from all stations
   */
  public off(): Listeners {
    const listeners = this.listeners;

    for (const listener of listeners) {
      removeListenerFromAll(listener);
    }

    return this;
  }

  /**
   * Sets the context of each listener
   */
  public using(context: any): Listeners {
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
  public addTo(station: Emitter): Listeners {
    const listeners = this.listeners;
    const stationMeta = station.stationMeta;

    for (const listener of listeners) {
      const crossOrigin = listener.crossOrigin;

      if (crossOrigin && crossOrigin !== station) {
        throw new Error(
          `Cross-emitter listeners can only be attached to their origin station.`
        );
      }

      addListener(stationMeta, listener);
    }

    return this;
  }

  /**
   * Removes each listener from the given station
   */
  public removeFrom(station: Emitter): Listeners {
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
  public has(
    matchingListener: MatchingListener,
    exactMatch?: boolean
  ): boolean {
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
  public isAttachedTo(station?: Emitter): boolean {
    if (!station) {
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

    for (const listener of listeners) {
      listener.isPaused = true;
    }

    return this;
  }

  /**
   * Un-pauses each listener
   */
  public resume(): Listeners {
    const listeners = this.listeners;

    for (const listener of listeners) {
      listener.isPaused = false;
    }

    return this;
  }

  /**
   * Determines whether any of listeners are paused
   */
  public isPaused(): boolean {
    const listeners = this.listeners;

    for (const listener of listeners) {
      if (listener.isPaused) return true;
    }

    return false;
  }

  /**
   * @returns An iterable object (array) containing a promise
   * for each listener that resolves when said listener is applied.
   * This method is dependant on `Promise`.
   * @see inject()
   */
  public toPromises(): Array<Promise<Listener>> {
    const promises: Array<Promise<Listener>> = [];
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
  public all(): Promise<Listener[]> {
    if (!deps.$Promise) {
      throw new Error(errors.NO_PROMISE);
    }

    return deps.$Promise.all<Listener>(this.toPromises());
  }

  /**
   * @returns A promise that resolves when one of the listeners is applied.
   * This method is dependant on `Promise`.
   * @see inject()
   */
  public race(): Promise<Listener> {
    if (!deps.$Promise) {
      throw new Error(errors.NO_PROMISE);
    }

    return deps.$Promise.race<Listener>(this.toPromises());
  }

  /**
   * Un-pauses each listener, and resets each listener's occurrence count
   */
  public reset(): Listeners {
    const listeners = this.listeners;

    for (const listener of listeners) {
      listener.occurrences = undefined;
      listener.isPaused = undefined;
    }

    return this;
  }

  /** Similar to Array.prototype.forEach() */
  public forEach(func: ForEachCallback): Listeners {
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
  public get(index: number): Listener {
    return this.listeners[index];
  }

  /** Retrieves the index of the given listener */
  public index(listener: Listener): number | undefined {
    const listeners = this.listeners;
    const count = listeners.length;

    for (let i = 0; i < count; i++) {
      if (listener === listeners[i]) return i;
    }

    return undefined;
  }

  /**
   * @returns A new `Listeners` object containing a clone of each Listener
   */
  public clone(): Listeners {
    const clonedListeners = this.listeners.map(cloneListener);

    return new Listeners(this.originStation, clonedListeners);
  }
}

/** Creates a `Promise` and adds its `resolve` function to the listener's `resolves` array */
function makePromise(listener: Listener): Promise<Listener> {
  if (!deps.$Promise) {
    throw new Error(errors.NO_PROMISE);
  }

  return new deps.$Promise<Listener>((resolve) => {
    if (!listener.resolves) {
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
function cloneListener(listener: Listener): Listener {
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
export function isListenersAttached(listeners: Listener[]) {
  for (const listener of listeners) {
    if (isListenerAttached(listener)) {
      return true;
    }
  }

  return false;
}

/** Determines whether the given listener is attached to any stations */
export function isListenerAttached(listener: Listener): boolean {
  return listener.stationMetas !== undefined;
}

/**
 * Determines whether the given station meta has listeners that match the given listeners
 * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
 */
function hasListeners(
  stationMeta: Meta,
  listeners: Listener[],
  exactMatch?: boolean
) {
  for (const listener of listeners) {
    if (hasListener(stationMeta, listener, exactMatch)) {
      return true;
    }
  }
  return false;
}

export interface ForEachCallback {
  (listener: Listener, index: number, listeners: Listener[]): any;
}
