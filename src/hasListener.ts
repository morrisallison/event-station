import {getAllListeners} from './getAllListeners';
import {Listener} from './Listener';
import {MatchingListener} from './MatchingListener';
import {matchListeners} from './matchListeners';
import {Meta} from './Meta';

/**
 * Determines whether the given listener is attached to the given station meta.
 * @param exactMatch If true, an exact value match will be performed instead of an approximate match.
 */
export function hasListener(stationMeta: Meta, listener: MatchingListener, exactMatch?: boolean): boolean {

    const listenersMap = stationMeta.listenersMap;
    const eventName = listener.eventName;
    var attachedListeners: Listener[];

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
