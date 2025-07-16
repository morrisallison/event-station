import { addListener } from "../actions/addListener";
import { applyListeners } from "../actions/applyListeners";
import type { Emitter } from "../types/Emitter";
import { getAllListeners } from "../actions/getAllListeners";
import { hasListener } from "../actions/hasListener";
import type { Listener } from "../types/Listener";
import { Listeners } from "./Listeners";
import type { ListenersMap } from "../types/ListenersMap";
import { makeStationId } from "../actions/makeStationId";
import { matchListener } from "../actions/matchListener";
import type { StationMeta } from "../types/StationMeta";
import type { Options } from "../types/Options";
import { removeListener } from "../actions/removeListener";
import type { StationMap } from "../types/StationMap";
import * as config from "../config";
import type {
  ListenersDefinition,
  CallbackFunction,
} from "../types/ListenersDefinition";

/** @internal */
export type InputEventName<EVT> =
  | ListenersDefinition.ToEventName<EVT>
  | config.AllEventName;

/** @internal */
export type InputEventNames<EVT> = (
  | ListenersDefinition.ToEventName<EVT>
  | config.AllEventName
)[];

/**
 * Event emitter class and namespace
 */
export class EventStation<EVT = ListenersDefinition> {
  /** Container for the station's context */
  public stationMeta!: StationMeta<EVT>;

  constructor(options?: Options) {
    EventStation.init(this, options);
  }

  /** An ID unique to all stations */
  public get stationId(): string {
    return this.stationMeta.stationId;
  }

  /** Number of listeners attached to the station */
  public get listenerCount(): number {
    return this.stationMeta.listenerCount;
  }

  /**
   * Number of listeners attached to other stations by the station.
   * This value is increased by using `hear()` and `hearOnce()`.
   */
  public get hearingCount(): number {
    return this.stationMeta.hearingCount;
  }

  /** Array of event names which have listeners on the station */
  public get listenerEventNames(): ListenersDefinition.ToEventName<EVT>[] {
    return Object.getOwnPropertyNames(
      this.stationMeta.listenersMap
    ) as ListenersDefinition.ToEventName<EVT>[];
  }

  /**
   * Creates and attaches listeners to the station
   */
  public on(listenerMap: CallbackMap<EVT>, context?: any): Listeners<EVT>;

  public on<TEventNames extends InputEventNames<EVT>>(
    eventNames: TEventNames,
    callback?: ListenersDefinition.PickCallbackFunction<
      EVT,
      TEventNames[number]
    >,
    context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>
  ): Listeners<EVT>;

  public on<TEventName extends InputEventName<EVT>>(
    eventName: TEventName,
    callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>,
    context?: ListenersDefinition.PickContext<EVT, TEventName>
  ): Listeners<EVT>;

  public on(q: any, r?: any, s?: any): Listeners<EVT> {
    const stationMeta = this.stationMeta;
    const listeners = makeListeners(this, false, q, r, s);

    for (const listener of listeners) {
      addListener(stationMeta, listener);
    }

    return new Listeners(this, listeners);
  }

  /**
   * Creates and attaches listeners to the station that are applied once and removed
   */
  public once(listenerMap: CallbackMap<EVT>, context?: any): Listeners<EVT>;

  public once<TEventNames extends InputEventNames<EVT>>(
    eventNames: TEventNames,
    callback?: ListenersDefinition.PickCallbackFunction<
      EVT,
      TEventNames[number]
    >,
    context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>
  ): Listeners<EVT>;

  public once<TEventName extends InputEventName<EVT>>(
    eventName: TEventName,
    callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>,
    context?: ListenersDefinition.PickContext<EVT, TEventName>
  ): Listeners<EVT>;

  public once(q: any, r?: any, s?: any): Listeners<EVT> {
    return this.on(q, r, s).occur(1);
  }

  /**
   * Removes listeners from the station that match the given arguments.
   * If no arguments are given, all listeners will be removed;
   * including listeners that were attached via `hear()` or `hearOnce()`.
   */
  public off(): void;

  public off(listenerMap: CallbackMap<EVT>, context?: any): void;

  public off<TEventNames extends InputEventNames<EVT>>(
    eventNames: TEventNames,
    callback?: ListenersDefinition.PickCallbackFunction<
      EVT,
      TEventNames[number]
    >,
    context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>
  ): void;

  public off<TEventName extends InputEventName<EVT>>(
    eventName: TEventName,
    callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>,
    context?: ListenersDefinition.PickContext<EVT, TEventName>
  ): void;

  public off(q?: any, r?: any, s?: any): void {
    const stationMeta = this.stationMeta;

    if (stationMeta.listenerCount < 1) return;

    // If no listener targets were given
    if (q === undefined) {
      removeAllListeners(stationMeta);
      return;
    }

    if (
      r === undefined &&
      s === undefined &&
      typeof q === "string" &&
      (!stationMeta.enableDelimiter || q.indexOf(stationMeta.delimiter) < 0)
    ) {
      removeListeners(q as ListenersDefinition.ToEventName<EVT>, stationMeta);
      return;
    }

    const listeners = makeListeners(this, true, q, r, s);

    for (const listener of listeners) {
      removeListener(stationMeta, listener);
    }
  }

  /**
   * Creates and attaches listeners to another station.
   * Listeners attached using this method can be removed specifically by using `disregard()`.
   */
  public hear(
    station: Emitter<EVT>,
    listenerMap: CallbackMap<EVT>,
    context?: any
  ): Listeners<EVT>;

  public hear<TEventNames extends InputEventNames<EVT>>(
    station: Emitter<EVT>,
    eventNames: TEventNames,
    callback?: ListenersDefinition.PickCallbackFunction<
      EVT,
      TEventNames[number]
    >,
    context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>
  ): Listeners<EVT>;

  public hear<TEventName extends InputEventName<EVT>>(
    station: Emitter<EVT>,
    eventName: TEventName,
    callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>,
    context?: ListenersDefinition.PickContext<EVT, TEventName>
  ): Listeners<EVT>;

  public hear(station: Emitter<EVT>, q: any, r?: any, s?: any): Listeners<EVT> {
    const heardStations = this.stationMeta.heardStations;
    const listeners = makeListeners(this, false, q, r, s);
    const targetStationMeta = station.stationMeta;

    for (const listener of listeners) {
      listener.hearer = this;
      listener.crossOrigin = station;
      addListener(targetStationMeta, listener);
      heardStations[station.stationId] = station;
    }

    return new Listeners(station, listeners);
  }

  /**
   * Attaches listeners to another station that are applied once and removed
   * Listeners attached using this method can be removed specifically by using `disregard()`.
   */
  public hearOnce(
    station: Emitter<EVT>,
    listenerMap: CallbackMap<EVT>,
    context?: any
  ): Listeners<EVT>;

  public hearOnce<TEventNames extends InputEventNames<EVT>>(
    station: Emitter<EVT>,
    eventNames: TEventNames,
    callback?: ListenersDefinition.PickCallbackFunction<
      EVT,
      TEventNames[number]
    >,
    context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>
  ): Listeners<EVT>;

  public hearOnce<TEventName extends InputEventName<EVT>>(
    station: Emitter<EVT>,
    eventName: TEventName,
    callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>,
    context?: ListenersDefinition.PickContext<EVT, TEventName>
  ): Listeners<EVT>;

  public hearOnce(
    station: Emitter<EVT>,
    q: any,
    r?: any,
    s?: any
  ): Listeners<EVT> {
    return this.hear(station, q, r, s).occur(1);
  }

  /**
   * Removes listeners from other stations that were attached by the station
   * via `hear()` and `hearOnce()`. If no arguments are given, all listeners
   * that were attached to other stations are removed.
   */
  public disregard(): void;

  public disregard(target: Emitter<EVT> | Emitter<EVT>[]): void;

  public disregard(
    target: Emitter<EVT> | Emitter<EVT>[],
    listenerMap: CallbackMap<EVT>,
    context?: any
  ): void;

  public disregard<TEventNames extends InputEventNames<EVT>>(
    target: Emitter<EVT> | Emitter<EVT>[],
    eventNames: TEventNames,
    callback?: ListenersDefinition.PickCallbackFunction<
      EVT,
      TEventNames[number]
    >,
    context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>
  ): void;

  public disregard<TEventName extends InputEventName<EVT>>(
    target: Emitter<EVT> | Emitter<EVT>[],
    eventName: TEventName,
    callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>,
    context?: ListenersDefinition.PickContext<EVT, TEventName>
  ): void;

  public disregard(target?: any, q?: any, r?: any, s?: any): void {
    const stationMeta = this.stationMeta;

    if (stationMeta.hearingCount < 1) return;

    let isRemovingAll = false;
    let listeners: Listener<EVT>[] = [];

    // If no listener targets were given
    if (q === undefined) {
      isRemovingAll = true;
    } else {
      listeners = makeListeners(this, true, q, r, s);
    }

    const stations = getTargetedStations(stationMeta, target);
    const count = stations.length;

    for (let x = 0; x < count; x++) {
      const station = stations[x];
      const targetStationMeta = station.stationMeta;

      if (isRemovingAll) {
        q = station.listenerEventNames;
        listeners = makeListeners(this, true, q, r, s);
      }

      for (const listener of listeners) {
        listener.hearer = this;
        removeListener(targetStationMeta, listener);
      }
    }

    if (isRemovingAll) {
      stationMeta.heardStations = Object.create(null);
    } else {
      cleanHeardStations(this);
    }
  }

  /**
   * Determines whether the station has attached listeners that match the
   * given arguments. If no arguments are given, the method determines
   * whether the station has any attached listeners.
   */
  public isHeard(): boolean;

  public isHeard(listenerMap: CallbackMap<EVT>, context?: any): boolean;

  public isHeard<TEventNames extends InputEventNames<EVT>>(
    eventNames: TEventNames,
    callback?: ListenersDefinition.PickCallbackFunction<
      EVT,
      TEventNames[number]
    >,
    context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>
  ): boolean;

  public isHeard<TEventName extends InputEventName<EVT>>(
    eventName: TEventName,
    callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>,
    context?: ListenersDefinition.PickContext<EVT, TEventName>
  ): boolean;

  public isHeard(q?: any, r?: any, s?: any): boolean {
    const stationMeta = this.stationMeta;
    const listenerCount = stationMeta.listenerCount;

    if (listenerCount < 1) return false;

    if (arguments.length < 1) {
      // Determine if any listeners are attached
      return listenerCount > 0;
    }

    const listeners = makeListeners(this, true, q, r, s);

    for (const listener of listeners) {
      if (hasListener(stationMeta, listener)) return true;
    }

    return false;
  }

  /**
   * Determines whether other stations have listeners matching the given
   * arguments that were attached by the station via `hear()` and `hearOnce()`.
   * If no arguments are given, the method determines whether other stations
   * have any listeners attached by the station via `hear()` and `hearOnce()`.
   */
  public isHearing(): boolean;

  public isHearing(target: Emitter<EVT> | Emitter<EVT>[]): boolean;

  public isHearing(
    target: Emitter<EVT> | Emitter<EVT>[],
    listenerMap: CallbackMap<EVT>
  ): boolean;

  public isHearing<TEventNames extends InputEventNames<EVT>>(
    target: Emitter<EVT> | Emitter<EVT>[],
    eventNames: TEventNames,
    callback?: ListenersDefinition.PickCallbackFunction<
      EVT,
      TEventNames[number]
    >
  ): boolean;

  public isHearing<TEventName extends InputEventName<EVT>>(
    target: Emitter<EVT> | Emitter<EVT>[],
    eventName: TEventName,
    callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>
  ): boolean;

  public isHearing(target?: any, q?: any, r?: any, s?: any): boolean {
    const stationMeta = this.stationMeta;

    if (stationMeta.hearingCount < 1) return false;

    const stations = getTargetedStations(stationMeta, target);
    let matchAllListeners: boolean = false;
    let listeners: Listener<EVT>[] = [];

    // If no listener targets were given
    if (q) {
      listeners = makeListeners(this, true, q, r, s);
    } else {
      matchAllListeners = true;
    }

    const count = stations.length;

    for (let x = 0; x < count; x++) {
      const station = stations[x];
      const targetStationMeta = station.stationMeta;

      if (matchAllListeners) {
        q = station.listenerEventNames;
        listeners = makeListeners(this, true, q, r, s);
      }

      for (const listener of listeners) {
        listener.hearer = this;

        if (hasListener(targetStationMeta, listener)) return true;
      }
    }

    return false;
  }

  /**
   * Emits events on the station.
   * Parameters after the first are passed to each listener's callback function.
   */
  public emit<EventNames extends ListenersDefinition.ToEventName<EVT>[]>(
    eventNames: EventNames,
    ...args: CallbackFunction.ToArgs<
      ListenersDefinition.PickCallbackFunction<EVT, EventNames[number]>
    >
  ): ReturnType<
    ListenersDefinition.PickCallbackFunction<EVT, EventNames[number]>
  >[];

  public emit<EventName extends ListenersDefinition.ToEventName<EVT>>(
    eventName: EventName,
    ...args: CallbackFunction.ToArgs<
      ListenersDefinition.PickCallbackFunction<EVT, EventName>
    >
  ): ReturnType<ListenersDefinition.PickCallbackFunction<EVT, EventName>>[];

  public emit(input: any, ...args: any[]): any[] {
    const stationMeta = this.stationMeta;

    if (stationMeta.listenerCount < 1) {
      return [];
    }

    const eventNames = parseEventNames(input, stationMeta);

    let results: unknown[] = [];

    for (const eventName of eventNames) {
      results = results.concat(
        emitEvent(
          eventName,
          this,
          false,
          args as ListenersDefinition.ToArgs<EVT>
        )
      );
    }

    return results;
  }

  /**
   * Emits events on the station, and then completes asynchronously.
   * Parameters after the first are passed to each listener's callback function.
   * @returns A `Promise` that resolves after all of the return listener promises resolve.
   */
  public async emitAsync<
    EventNames extends ListenersDefinition.ToEventName<EVT>[]
  >(
    eventNames: EventNames,
    ...args: CallbackFunction.ToArgs<
      ListenersDefinition.PickCallbackFunction<EVT, EventNames[number]>
    >
  ): Promise<
    Awaited<
      ReturnType<
        ListenersDefinition.PickCallbackFunction<EVT, EventNames[number]>
      >
    >[]
  >;

  public async emitAsync<
    EventName extends ListenersDefinition.ToEventName<EVT>
  >(
    eventName: EventName,
    ...args: CallbackFunction.ToArgs<
      ListenersDefinition.PickCallbackFunction<EVT, EventName>
    >
  ): Promise<
    Awaited<
      ReturnType<ListenersDefinition.PickCallbackFunction<EVT, EventName>>
    >[]
  >;

  public async emitAsync(input: any, ...args: any[]): Promise<any[]> {
    const results = this.emit(input, ...(args as any));

    if (results.length === 0) {
      return [];
    }

    return Promise.all<any>(results);
  }

  /**
   * Creates listeners without attaching them to the station
   */
  public makeListeners(
    listenerMap: CallbackMap<EVT>,
    context?: any
  ): Listeners<EVT>;

  public makeListeners<TEventNames extends InputEventNames<EVT>>(
    eventNames: TEventNames,
    callback?: ListenersDefinition.PickCallbackFunction<
      EVT,
      TEventNames[number]
    >,
    context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>
  ): Listeners<EVT>;

  public makeListeners<TEventName extends InputEventName<EVT>>(
    eventName: TEventName,
    callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>,
    context?: ListenersDefinition.PickContext<EVT, TEventName>
  ): Listeners<EVT>;

  public makeListeners(q: any, r?: any, s?: any): Listeners<EVT> {
    const listeners = makeListeners(this, false, q, r, s);

    return new Listeners(this, listeners);
  }

  /**
   * @returns Listeners from the station that match the given arguments.
   * If no arguments are given, all listeners will be returned;
   * including listeners that were attached via `hear()` or `hearOnce()`.
   */
  public getListeners(): Listeners<EVT> | undefined;

  public getListeners(
    listenerMap: CallbackMap<EVT>,
    context?: any
  ): Listeners<EVT> | undefined;

  public getListeners<TEventNames extends InputEventNames<EVT>>(
    eventNames: TEventNames,
    callback?: ListenersDefinition.PickCallbackFunction<
      EVT,
      TEventNames[number]
    >,
    context?: ListenersDefinition.PickContext<EVT, TEventNames[number]>
  ): Listeners<EVT> | undefined;

  public getListeners<TEventName extends InputEventName<EVT>>(
    eventName: TEventName,
    callback?: ListenersDefinition.PickCallbackFunction<EVT, TEventName>,
    context?: ListenersDefinition.PickContext<EVT, TEventName>
  ): Listeners<EVT> | undefined;

  public getListeners(q?: any, r?: any, s?: any): Listeners<EVT> | undefined {
    const attachedListeners = getAllListeners(this.stationMeta);

    if (attachedListeners.length < 1) {
      return undefined;
    }
    if (arguments.length < 1) {
      return new Listeners(this, attachedListeners);
    }

    const matchingListeners = makeListeners(this, true, q, r, s);
    const listeners: Listener<EVT>[] = [];

    for (const attachedListener of attachedListeners) {
      for (const matchingListener of matchingListeners) {
        if (matchListener(matchingListener, attachedListener)) {
          listeners.push(attachedListener);
          break;
        }
      }
    }

    // No matching listeners were found
    if (listeners.length < 1) return undefined;

    return new Listeners(this, listeners);
  }

  /**
   * Stops the propagation of an emitted event. When called, this method effectively does
   * nothing if an event is not being emitted at the time.
   */
  public stopPropagation(): void {
    this.stationMeta.isPropagationStopped = true;
  }

  /**
   * Adds the given listener to the station
   */
  public addListener(listener: Listener<EVT>): void {
    addListener(this.stationMeta, listener);
  }

  /**
   * Removes all listeners that match the given listener from the station
   * @param exactMatch - If true, an exact value match will be performed instead of an approximate match.
   */
  public removeListener(listener: Listener<EVT>, exactMatch?: boolean): void {
    removeListener(this.stationMeta, listener, exactMatch);
  }

  /**
   * Determines whether any listener attached to the station matches the given listener.
   * @param exactMatch - If true, an exact value match will be performed instead of an approximate match.
   */
  public hasListener(listener: Listener<EVT>, exactMatch?: boolean): boolean {
    return hasListener(this.stationMeta, listener, exactMatch);
  }

  /** Initializes the given object */
  public static init(obj: any, options?: Options): typeof EventStation {
    obj.stationMeta = makeStationMeta(options);

    return EventStation;
  }

  /** Modifies the global configuration */
  public static config(opts: Options): typeof EventStation {
    config.config(opts);

    return EventStation;
  }

  /** Resets the global configuration and injected dependencies */
  public static reset(): typeof EventStation {
    config.reset();

    return EventStation;
  }

  /** Creates a new station with the given options */
  public static create<EVT>(options?: Options): Emitter<EVT> {
    return new EventStation(options);
  }
}

function parseEventNames<EVT>(
  eventNames: ListenersDefinition.ToEventName<EVT>[],
  options: StationMeta<EVT>
): ListenersDefinition.ToEventName<EVT>[];
function parseEventNames<EVT>(
  eventName: ListenersDefinition.ToEventName<EVT>,
  options: StationMeta<EVT>
): ListenersDefinition.ToEventName<EVT>[];
function parseEventNames<EVT>(
  input: any,
  options: StationMeta<EVT>
): ListenersDefinition.ToEventName<EVT>[] {
  let names: string[];

  if (typeof input === "string") {
    const delimiter = options.delimiter;

    if (options.enableDelimiter && delimiter) {
      names = input.split(delimiter);
    } else {
      names = [input];
    }
  } else if (Array.isArray(input)) {
    names = input;
  } else {
    throw new Error(`Invalid first argument`);
  }

  return names as ListenersDefinition.ToEventName<EVT>[];
}

/** Creates a new station meta object from the given configuration options */
function makeStationMeta<EVT>(options: Options = {}): StationMeta<EVT> {
  const state = {
    heardStations: Object.create(null),
    hearingCount: 0,
    isPropagationStopped: false,
    listenerCount: 0,
    listenersMap: Object.create(null),
    stationId: makeStationId(),
  };

  const meta = config.mergeOptions<StationMeta<EVT>>(
    state,
    config.globalOptions,
    options
  );

  config.assertOptions(meta);

  return meta;
}

/**
 * Makes an array of listeners from the given parameters
 * This function normalizes the four ways to make listeners.
 */
function makeListeners<EVT>(
  origin: Emitter<EVT>,
  isMatching: boolean,
  listenerMap: CallbackMap<EVT>,
  context?: Emitter<EVT>
): Listener<EVT>[];

function makeListeners<EVT>(
  origin: Emitter<EVT>,
  isMatching: boolean,
  eventNames: InputEventNames<EVT>,
  callback?: ListenersDefinition.ToCallbackFunction<EVT>,
  context?: Emitter<EVT>
): Listener<EVT>[];

function makeListeners<EVT>(
  origin: Emitter<EVT>,
  isMatching: boolean,
  eventName: InputEventName<EVT>,
  callback?: ListenersDefinition.ToCallbackFunction<EVT>,
  context?: Emitter<EVT>
): Listener<EVT>[];

function makeListeners<EVT>(
  origin: Emitter<EVT>,
  isMatching: boolean,
  q: any,
  r?: any,
  s?: any
): Listener<EVT>[] {
  if (typeof q === "string") {
    const stationMeta = origin.stationMeta;
    const enableDelimiter = stationMeta.enableDelimiter;
    const delimiter = stationMeta.delimiter;

    if (enableDelimiter && q.indexOf(delimiter) >= 0) {
      const _q = (q as string).split(
        delimiter
      ) as ListenersDefinition.ToEventName<EVT>[];

      return makeListenersFromArray<EVT>(origin, isMatching, _q, r, s);
    }

    return [
      {
        eventName: q as ListenersDefinition.ToEventName<EVT>,
        callback: r,
        context: !isMatching && s === undefined ? origin : s,
        matchCallback: r,
        matchContext: s,
      },
    ];
  }

  if (Array.isArray(q)) {
    return makeListenersFromArray(origin, isMatching, q, r, s);
  }

  if (typeof q === "object") {
    return makeListenersFromMap(origin, isMatching, q, r);
  }

  throw new Error(`Invalid arguments`);
}

/** Makes an array of listeners from the given listener map */
function makeListenersFromMap<EVT>(
  originStation: Emitter<EVT>,
  isMatching: boolean,
  listenerMap: CallbackMap<EVT>,
  context: any
): Listener<EVT>[] {
  const listeners: Listener<EVT>[] = [];
  const eventNames = Object.getOwnPropertyNames(
    listenerMap
  ) as ListenersDefinition.ToEventName<EVT>[];

  for (const eventName of eventNames) {
    listeners.push({
      eventName: eventName as unknown as ListenersDefinition.ToEventName<EVT>,
      callback: listenerMap[
        eventName
      ] as ListenersDefinition.ToCallbackFunction<EVT>,
      context: !isMatching && context === undefined ? originStation : context,
      matchCallback: listenerMap[
        eventName
      ] as ListenersDefinition.ToCallbackFunction<EVT>,
      matchContext: context,
    });
  }

  return listeners;
}

/** Makes an array of listeners from the given event name array */
function makeListenersFromArray<EVT>(
  origin: Emitter<EVT>,
  isMatching: boolean,
  eventNames: ListenersDefinition.ToEventName<EVT>[],
  callback: ListenersDefinition.ToCallbackFunction<EVT>,
  context: any
): Listener<EVT>[] {
  const listeners: Listener<EVT>[] = [];
  const count = eventNames.length;

  for (let i = 0; i < count; i++) {
    listeners.push({
      eventName: eventNames[i],
      callback: callback,
      context: !isMatching && context === undefined ? origin : context,
      matchContext: context,
      matchCallback: callback,
    });
  }

  return listeners;
}

function emitEvent<EVT>(
  eventName: ListenersDefinition.ToEventName<EVT>,
  originStation: Emitter<EVT>,
  enableAsync: boolean,
  args: ListenersDefinition.ToArgs<EVT>
): ListenersDefinition.ToReturnValue<EVT>[] {
  const stationMeta = originStation.stationMeta;
  const listenersMap = stationMeta.listenersMap;

  let listeners: Listener<EVT>[] | undefined = undefined;

  if (stationMeta.enableRegExp) {
    listeners = searchListeners(
      eventName,
      listenersMap,
      stationMeta.regExpMarker
    );
  } else {
    listeners = listenersMap[eventName];
  }

  let results: ListenersDefinition.ToReturnValue<EVT>[] = [];

  if (listeners) {
    results = [
      ...results,
      ...applyListeners<EVT>(listeners, originStation, enableAsync, args),
    ];
  }

  const listenersMapAll: Listener<EVT>[] | undefined =
    listenersMap[config.ALL_EVENT_NAME];

  if (stationMeta.emitAllEvent && listenersMapAll) {
    const argsAll = args.slice() as ListenersDefinition.ToArgs<EVT>;

    argsAll.splice(0, 0, eventName);

    results = [
      ...results,
      ...applyListeners<EVT>(
        listenersMapAll,
        originStation,
        enableAsync,
        argsAll
      ),
    ];
  }

  return results;
}

/**
 * Retrieves listeners from the given listener map
 * that match the given event name. Specifically,
 * this function recognizes regular expression listeners.
 */
function searchListeners<EVT>(
  eventName: ListenersDefinition.ToEventName<EVT>,
  listenersMap: ListenersMap<EVT>,
  regExpMarker: string
): Listener<EVT>[] {
  let listeners: Listener<EVT>[] = [];

  for (const expression in listenersMap) {
    if (expression.indexOf(regExpMarker) === 0) {
      if (new RegExp(expression.substr(regExpMarker.length)).test(eventName)) {
        listeners = listeners.concat(listenersMap[expression]);
      }
    } else if (expression === eventName) {
      listeners = listeners.concat(listenersMap[eventName]);
    }
  }

  return listeners;
}

/** Clean the `heardStations` property of the meta of the given station */
function cleanHeardStations<EVT>(station: Emitter<EVT>): void {
  const stationMap: StationMap<EVT> = Object.create(null);
  const heardStations = station.stationMeta.heardStations;

  for (const stationId in heardStations) {
    const heardStation = heardStations[stationId];

    if (hasListener(heardStation.stationMeta, { hearer: station })) {
      stationMap[stationId] = heardStation;
    }
  }

  station.stationMeta.heardStations = stationMap;
}

/** Removes all listeners from then given station meta */
function removeAllListeners<EVT>(stationMeta: StationMeta<EVT>): void {
  const listenersMap = stationMeta.listenersMap;

  for (const eventName in listenersMap) {
    const listeners = listenersMap[eventName];

    for (const listener of listeners) {
      const hearer = listener.hearer;

      if (hearer) {
        hearer.stationMeta.hearingCount--;
      }
    }
  }

  stationMeta.listenerCount = 0;
  stationMeta.listenersMap = Object.create(null);
}

/** Removes all listeners for a particular event from the given station meta */
function removeListeners<EVT>(
  eventName: ListenersDefinition.ToEventName<EVT>,
  stationMeta: StationMeta<EVT>
): void {
  const listenersMap = stationMeta.listenersMap;
  const listeners = listenersMap[eventName];

  if (listeners === undefined) return;

  const count = listeners.length;

  for (let i = 0; i < count; i++) {
    const listener = listeners[i];
    const hearer = listener.hearer;

    if (hearer) {
      hearer.stationMeta.hearingCount--;
    }
  }

  stationMeta.listenerCount = stationMeta.listenerCount - count;
  delete listenersMap[eventName];
}

/**
 * Retrieves the targeted stations from the given parameters
 * This function normalizes the the target station for
 * cross-emitter listening methods.
 */
function getTargetedStations<EVT>(
  stationMeta: StationMeta<EVT>,
  target?: Emitter<EVT> | Emitter<EVT>[]
): Emitter<EVT>[] {
  if (target === undefined) {
    return getHeardStations(stationMeta);
  }

  if (Array.isArray(target)) {
    return target;
  }

  if (target.stationMeta) {
    return [target];
  }

  throw new Error(`Invalid target`);
}

/**
 * @returns the heard stations of a given station's meta as an array
 */
function getHeardStations<EVT>(stationMeta: StationMeta<EVT>): Emitter<EVT>[] {
  const stations: Emitter<EVT>[] = [];
  const heardStations = stationMeta.heardStations;

  for (const stationId in heardStations) {
    stations.push(heardStations[stationId]);
  }

  return stations;
}

/**
 * A literal object with non-delimited event names
 * as keys and callback functions as values.
 */
export type CallbackMap<EVT> = EVT extends ListenersDefinition
  ? Partial<
      Record<
        ListenersDefinition.ToEventName<EVT>,
        ListenersDefinition.ToCallbackFunction<EVT>
      >
    >
  : Partial<Record<string, CallbackFunction.Any>>;
