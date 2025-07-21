import type { AllEventName } from "../config";

/**
 * A function that is used as a listener callback.
 */
/*
 * ### Private Remarks
 *
 * This type is primarily used internally to define the structure of listener callbacks.
 */
export type CallbackFunction<Context, Args extends any[], ReturnValue> = (
  this: Context,
  ...args: Args
) => ReturnValue;

export namespace CallbackFunction {
  export type Any = CallbackFunction<any, any[], any>;

  /**
   * Extracts the context type from a callback function.
   */
  export type ToContext<CF> = CF extends CallbackFunction<infer C, any[], any>
    ? C
    : any;

  /**
   * Extracts the arguments type from a callback function.
   */
  export type ToArgs<CF> = CF extends CallbackFunction<any, infer A, any>
    ? A
    : any[];
}

/**
 * A type that defines a mapping of event names to callback functions.
 * This is used to define the structure of listeners in an event station.
 *
 * @remarks
 *
 * It's not recommended to use this type to define listeners, instead
 * use a plain object with event names as keys and callback functions as values.
 */
export type ListenersDefinition<
  E extends string = string,
  C = CallbackFunction.Any
> = Record<E, C>;

export namespace ListenersDefinition {
  /**
   * Extracts the event name type from a listeners definition.
   */
  export type ToEventName<EVT> = EVT extends ListenersDefinition
    ? Exclude<keyof EVT, symbol | number>
    : string;

  /**
   * Extracts the return value type from a listeners definition.
   * This is used to determine the type of value returned by a listener callback.
   */
  export type ToReturnValue<EVT> = EVT extends Record<
    string,
    CallbackFunction<any, any[], infer R>
  >
    ? R
    : unknown;

  /**
   * Extracts the callback function type for a specific event name from a listeners definition.
   * This is useful for getting the type of a listener callback for a specific event.
   */
  export type PickCallbackFunction<EVT, EventName> =
    EventName extends AllEventName
      ? CallbackFunction.Any
      : EventName extends keyof EVT
      ? EVT[EventName] extends CallbackFunction.Any
        ? EVT[EventName]
        : never
      : never;

  /**
   * Extracts the context type for a specific event name from a listeners definition.
   * This is useful for getting the type of `this` context used in a listener callback.
   */
  export type PickContext<EVT, EventName> = EventName extends AllEventName
    ? any
    : EventName extends keyof EVT
    ? EVT[EventName] extends CallbackFunction.Any
      ? CallbackFunction.ToContext<EVT[EventName]>
      : never
    : never;

  /**
   * Extracts the callback function type from a listeners definition.
   * This is useful for getting the type of a listener callback for any event of the definition.
   */
  export type ToCallbackFunction<EVT> = EVT extends Record<
    string,
    CallbackFunction.Any
  >
    ? EVT[keyof EVT]
    : CallbackFunction.Any;

  /**
   * Extracts the context type from a listeners definition.
   * This is useful for getting the type of `this` context used in any listener callback of the definition.
   */
  export type ToContext<EVT> = CallbackFunction.ToContext<
    ToCallbackFunction<EVT>
  >;

  /**
   * Extracts the arguments type from a listeners definition.
   * This is useful for getting the type of arguments passed to any listener callback of the definition.
   */
  export type ToArgs<EVT> = CallbackFunction.ToArgs<ToCallbackFunction<EVT>>;
}
