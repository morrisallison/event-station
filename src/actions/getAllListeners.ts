import {Listener} from '../types/Listener';
import {Meta} from '../types/Meta';

/** Retrieves all listeners attached to the given Meta */
export function getAllListeners(stationMeta: Meta): Listener[] {

    if (stationMeta.listenerCount < 1) return [];

    const listenersMap = stationMeta.listenersMap;
    var listeners: Listener[] = [];

    for (let eventName in listenersMap) {
        listeners = listeners.concat(listenersMap[eventName]);
    }

    return listeners;
}
