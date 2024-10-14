export namespace Rx {
  export type Observable = any;

  export interface ObservableStatic {
    fromEventPattern<T>(
      addHandler: (handler: Function) => void,
      removeHandler: (handler: Function) => void,
      selector?: (args: any[]) => T
    ): Observable;
  }
}
