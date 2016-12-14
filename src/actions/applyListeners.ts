import {EventStation} from '../models/EventStation';
import {Listener} from '../types/Listener';
import {removeListenerFromAll} from './removeListenerFromAll';

/** Applies the given listeners with the given arguments */
export function applyListeners<P extends Promise<any>>(listeners: Listener[], originStation: EventStation, enableAsync: boolean, args: ListenerArguments): P[] | void {

    const argsLength = args.length;
    const stationMeta = originStation.stationMeta;

    stationMeta.isPropagationStopped = false;

    var promises: P[] = [];
    var result: any;

    for (let listener of listeners) {

        if (stationMeta.isPropagationStopped) {
            stationMeta.isPropagationStopped = false;
            return;
        }

        if (listener.isPaused) continue;

        const callback = listener.callback;
        const context = listener.context;

        if (callback) {
            switch (argsLength) {
                case 0:
                    result = callback.call(context);
                    break;
                case 1:
                    result = callback.call(context, args[0]);
                    break;
                case 2:
                    result = callback.call(context, args[0], args[1]);
                    break;
                case 3:
                    result = callback.call(context, args[0], args[1], args[2]);
                    break;
                default:
                    result = callback.apply(context, args);
                    break;
            }
        }

        /*
         * Is async enabled, and is the result a Promise-like object
         */
        if (
            enableAsync
            && result
            && typeof result.then === 'function'
            && typeof result.catch === 'function'
        ) {
            promises.push(<P>result);
        }

        const resolves = listener.resolves;

        if (resolves) {

            for (let resolve of resolves) {
                resolve(listener);
            }

            listener.resolves = undefined;
        }

        const maxOccurrences = listener.maxOccurrences;
        let occurrences = listener.occurrences;

        if (maxOccurrences !== undefined) {

            if (occurrences === undefined) {
                occurrences = listener.occurrences = 1;
            } else {
                occurrences = ++listener.occurrences;
            }

            if (occurrences === maxOccurrences) {
                removeListenerFromAll(listener);
            }
        }
    }

    return promises;
}

export interface ListenerArguments {
    [index: number]: any;
    length: number;
}
