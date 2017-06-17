import { Listener } from '../types/Listener';
import { Meta } from '../types/Meta';

/** Retrieves all listeners attached to the given Meta */
export function getAllListeners(stationMeta: Meta): Listener[] {

    if (stationMeta.listenerCount < 1) return [];

    const listenersMap = stationMeta.listenersMap;
    let listeners: Listener[] = [];

    // `listenersMap` has no prototype
    // tslint:disable-next-line:no-for-in forin
    for (const eventName in listenersMap) {
        listeners = listeners.concat(listenersMap[eventName]);
    }

    return listeners;
}
