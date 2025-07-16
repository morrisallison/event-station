import type { Listener } from "./Listener";
import type { ALL_EVENT_NAME } from "../config";
import type { ListenersDefinition } from "./ListenersDefinition";

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
type RegExpString = string;

/** An object of listener arrays with event names and expressions as keys */
export type ListenersMap<EVT> = Record<
  ListenersDefinition.ToEventName<EVT> | typeof ALL_EVENT_NAME | RegExpString,
  Listener<EVT>[]
>;
