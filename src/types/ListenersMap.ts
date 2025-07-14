import type { Listener } from "./Listener";

/** An object of listener arrays with event names and expressions as keys */
export interface ListenersMap {
  [eventName: string]: Listener[];
}
