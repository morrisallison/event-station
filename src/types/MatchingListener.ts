import type { Emitter } from "./Emitter";
import type { ListenersDefinition } from "./ListenersDefinition";

/**
 * A subset of the Listener interface used only for
 * comparing two Listener objects.
 * @see Listener
 * @see matchListener()
 */
export interface MatchingListener<EVT> {
  /** @see Listener.eventName */
  eventName?: ListenersDefinition.ToEventName<EVT>;
  /** @see Listener.matchCallback */
  matchCallback?: ListenersDefinition.ToCallbackFunction<EVT>;
  /** @see Listener.matchContext */
  matchContext?: any;
  /** @see Listener.hearer */
  hearer?: Emitter<EVT>;
}
