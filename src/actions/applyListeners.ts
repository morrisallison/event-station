import type { Emitter } from "../types/Emitter";
import type { Listener } from "../types/Listener";
import { removeListenerFromAll } from "./removeListenerFromAll";
import type {
  ListenersDefinition,
  CallbackFunction,
} from "../types/ListenersDefinition";

/** Applies the given listeners with the given arguments */
export function applyListeners<EVT>(
  _listeners: Listener<EVT>[],
  originStation: Emitter<EVT>,
  enableAsync: boolean,
  args: ListenersDefinition.ToArgs<EVT>
): ListenersDefinition.ToReturnValue<EVT>[] {
  const argsLength = args.length;
  const stationMeta = originStation.stationMeta;

  stationMeta.isPropagationStopped = false;

  const results: ListenersDefinition.ToReturnValue<EVT>[] = [];

  /* Clone array to prevent mutation */
  const listeners = _listeners.slice();

  for (const listener of listeners) {
    let result: ListenersDefinition.ToReturnValue<EVT>;

    if (stationMeta.isPropagationStopped) {
      stationMeta.isPropagationStopped = false;

      return results;
    }

    if (listener.isPaused) continue;

    const callback = listener.callback;
    const context = listener.context;

    if (callback) {
      // This is/was a performance optimization to use `call` instead of `apply`
      // when the number of arguments is known to be small.
      // However, engine optimizations have improved to the point that this may
      // not be beneficial anymore; it's been almost a decade.
      // TODO: Benchmark this again.
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

      results.push(result);
    }

    const resolves = listener.resolves;

    if (resolves) {
      for (const resolve of resolves) {
        resolve(listener);
      }

      listener.resolves = undefined;
    }

    const { maxOccurrences } = listener;
    let { occurrences } = listener;

    if (maxOccurrences !== undefined) {
      if (occurrences === undefined) {
        occurrences = 0;
      }

      listener.occurrences = ++occurrences;

      if (occurrences === maxOccurrences) {
        removeListenerFromAll(listener);
      }
    }
  }

  return results;
}

export interface ListenerArguments {
  [index: number]: any;
  length: number;
}
