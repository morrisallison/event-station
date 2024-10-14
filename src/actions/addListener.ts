import { Listener } from "../types/Listener";
import { Meta } from "../types/Meta";

/** Adds the given listener to the given station meta */
export function addListener(stationMeta: Meta, listener: Listener): void {
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
