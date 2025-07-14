import type { Emitter } from "./Emitter";

/**
 * A subset of the Listener interface used only for
 * comparing two Listener objects.
 * @see Listener
 * @see matchListener()
 */
export interface MatchingListener {
  /** @see Listener.eventName */
  eventName?: string;
  /** @see Listener.matchCallback */
  matchCallback?: Function;
  /** @see Listener.matchContext */
  matchContext?: any;
  /** @see Listener.hearer */
  hearer?: Emitter;
}
