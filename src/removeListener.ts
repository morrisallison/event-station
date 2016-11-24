import {Listener} from './Listener';
import {matchListener} from './matchListener';
import {Meta} from './Meta';

/**
 * Removes all listeners that match the given listener from the given station meta.
 * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
 */
export function removeListener(stationMeta: Meta, listener: Listener, exactMatch?: boolean): void {

    if (stationMeta.listenerCount < 1) return;

    const listenersMap = stationMeta.listenersMap;
    const eventName = listener.eventName;
    const attachedListeners = listenersMap[eventName];

    if (!attachedListeners) return;

    let attachedListenersCount = attachedListeners.length;

    if (attachedListenersCount === 1) {

        if (!matchListener(listener, attachedListeners[0], exactMatch)) return;

        delete listenersMap[eventName];
        stationMeta.listenerCount--;
        reduceHearerHearingCount(listener);
        removeMetaFromStation(stationMeta, listener);

        return;
    }

    for (let i = 0, c = attachedListenersCount; i < c; i++) {

        let attachedListener = attachedListeners[i];

        if (!matchListener(listener, attachedListener, exactMatch)) continue;

        /* Remove the listener from the given Meta */
        attachedListeners.splice(i, 1);
        stationMeta.listenerCount--;
        i--;
        c--;

        reduceHearerHearingCount(listener);
        removeMetaFromStation(stationMeta, listener);
    }

    if (attachedListeners.length < 1) {
        delete listenersMap[eventName];
    }
}

function removeMetaFromStation(targetMeta: Meta, listener: Listener) {

    const stationMetas = listener.stationMetas;

    if (!stationMetas) return;

    if (stationMetas.length === 1) {
        listener.stationMetas = undefined;
        return;
    }

    const newStationMetas: Meta[] = [];

    for (let stationMeta of stationMetas) {
        if (stationMeta !== targetMeta) {
            newStationMetas.push(stationMeta);
        }
    }

    if (newStationMetas.length < 1) {
        /*
         * This line is necessary in the rare case that
         * the exact same listener object has been added to
         * a station multiple times, and is then removed from
         * said station.
         */
        listener.stationMetas = undefined;
    } else {
        listener.stationMetas = newStationMetas;
    }
}

function reduceHearerHearingCount(listener: Listener): void {

    /*
     * Update the hearingCount of given listener's hearer
     */
    const hearer = listener.hearer;

    if (hearer) {
        hearer.stationMeta.hearingCount--;
    }
}
