import { getAllListeners } from "./getAllListeners";
import type { Listener } from "../types/Listener";
import type { MatchingListener } from "../types/MatchingListener";
import { matchListeners } from "./matchListeners";
import type { StationMeta } from "../types/StationMeta";

/**
 * Determines whether the given listener is attached to the given station meta.
 * @param exactMatch - If true, an exact value match will be performed instead of an approximate match.
 */
export function hasListener<EVT>(
  stationMeta: StationMeta<EVT>,
  listener: MatchingListener<EVT>,
  exactMatch?: boolean
): boolean {
  const listenersMap = stationMeta.listenersMap;
  const eventName = listener.eventName;

  let attachedListeners: Listener<EVT>[];

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
