import type { Rx } from "./types/Rx";

declare const global: any;
declare const window: any;

// TODO: Remove this
export namespace deps {
  /**
   * A reference to the injected Rx namespace.
   * @see inject()
   * @deprecated Use the `rxjs` package directly instead.
   */
  export let $RxObservable: Rx.ObservableStatic | undefined = undefined;

  /**
   * A reference to the Promise object, or an injected Promise-like object.
   * @see inject()
   * @deprecated Use the global Promise object instead.
   */
  export let $Promise: typeof Promise = Promise;
}
