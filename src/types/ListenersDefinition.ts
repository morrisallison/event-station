import type { AllEventName } from "../config";

export type CallbackFunction<Context, Args extends any[], ReturnValue> = (
  this: Context,
  ...args: Args
) => ReturnValue;

export namespace CallbackFunction {
  export type Any = CallbackFunction<any, any[], any>;

  export type ToContext<CF> = CF extends CallbackFunction<infer C, any[], any>
    ? C
    : any;

  export type ToArgs<CF> = CF extends CallbackFunction<any, infer A, any>
    ? A
    : any[];
}

export type ListenersDefinition<
  E extends string = string,
  C = CallbackFunction.Any
> = Record<E, C>;

export namespace ListenersDefinition {
  export type ToEventName<EVT> = EVT extends ListenersDefinition
    ? Exclude<keyof EVT, symbol | number>
    : string;

  export type ToReturnValue<EVT> = EVT extends Record<
    string,
    CallbackFunction<any, any[], infer R>
  >
    ? R
    : unknown;

  export type PickCallbackFunction<EVT, EventName> =
    EventName extends AllEventName
      ? CallbackFunction.Any
      : EventName extends keyof EVT
      ? EVT[EventName] extends CallbackFunction.Any
        ? EVT[EventName]
        : never
      : never;

  export type PickContext<EVT, EventName> = EventName extends AllEventName
    ? any
    : EventName extends keyof EVT
    ? EVT[EventName] extends CallbackFunction.Any
      ? CallbackFunction.ToContext<EVT[EventName]>
      : never
    : never;

  export type ToCallbackFunction<EVT> = EVT extends Record<
    string,
    CallbackFunction.Any
  >
    ? EVT[keyof EVT]
    : CallbackFunction.Any;

  export type ToContext<EVT> = CallbackFunction.ToContext<
    ToCallbackFunction<EVT>
  >;

  export type ToArgs<EVT> = CallbackFunction.ToArgs<ToCallbackFunction<EVT>>;
}
