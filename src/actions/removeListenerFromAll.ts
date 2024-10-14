import { Listener } from "../types/Listener";
import { removeListener } from "./removeListener";

/** Removes the given listener from all of the station meta it's attached to */
export function removeListenerFromAll(listener: Listener): void {
  const stationMetas = listener.stationMetas;

  if (!stationMetas) return;

  for (const stationMeta of stationMetas) {
    removeListener(stationMeta, listener, true);
  }
}
