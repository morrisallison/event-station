import {Rx} from './types/Rx';

declare const global: any;
declare const window: any;

export namespace deps {
    /**
     * A reference to the injected Rx namespace.
     * @see inject()
     */
    export let $RxObservable: Rx.ObservableStatic | void = undefined;

    /**
     * A reference to the Promise object, or an injected Promise-like object.
     * @see inject()
     */
    export let $Promise: typeof Promise | void = getGlobalPromise();
}

/**
 * Injects or overrides an optional dependency.
 *
 * Use this method to provide EventStation with the `rx` namespace.
 * Doing so enables the use of `Listeners.prototype.toObservable()`.
 *
 *     inject('rx', rx)
 *
 * EventStation will use the native Promise object by default.
 * If a Promise object isn't globally available, one can be
 * injected to be used in its place.
 *
 *     inject('Promise', YourPromiseObject)
 *
 * For example, Bluebird can be injected to override the Promise used
 * within EventStation instances.
 */
export function inject(name: 'rx', rx: any): void;
export function inject<P extends typeof Promise>(name: 'Promise', promise: P): void;
export function inject(name: string, obj: any): void;
export function inject(name: string, obj: any): void {

    switch (name) {

        case 'rx':
            deps.$RxObservable = obj ? obj.Observable : obj;
            break;

        case 'Promise':
            deps.$Promise = obj;
            break;

        default:
            throw new Error('Invalid name');
    }
}

/** Reset injected dependencies */
export function reset(): void {
    deps.$RxObservable = undefined;
    deps.$Promise = getGlobalPromise();
}

function getGlobalPromise(): typeof Promise {
    const glob = typeof window === 'object' ? window : global;

    return glob.Promise;
}
