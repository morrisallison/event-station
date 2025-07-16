import type { Listener } from "../types/Listener";
import type { StationMeta } from "../types/StationMeta";

/** Retrieves all listeners attached to the given Meta */
export function getAllListeners<EVT>(
  stationMeta: StationMeta<EVT>
): Listener<EVT>[] {
  if (stationMeta.listenerCount < 1) return [];

  const listenersMap = stationMeta.listenersMap;
  let listeners: Listener<EVT>[] = [];

  for (const eventName in listenersMap) {
    listeners = listeners.concat(listenersMap[eventName]);
  }

  return listeners;
}
