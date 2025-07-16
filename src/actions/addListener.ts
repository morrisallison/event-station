import type { Listener } from "../types/Listener";
import type { StationMeta } from "../types/StationMeta";

/** Adds the given listener to the given station meta */
export function addListener<EVT>(
  stationMeta: StationMeta<EVT>,
  listener: Listener<EVT>
): void {
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
