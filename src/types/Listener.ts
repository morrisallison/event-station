import type { Emitter } from "./Emitter";
import type { StationMeta } from "./StationMeta";
import type { ListenersDefinition } from "./ListenersDefinition";

/**
 * An object that holds the state of a listener.
 * Listeners can can exist while separated from a station,
 * and can be moved between stations freely.
 */
export interface Listener<EVT> {
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
