/**
 * See the [configuration section](http://morrisallison.github.io/event-station/usage.html#configuration)
 * of the usage documentation for general usage.
 */
export interface Options {
  /**
   * The character used to delimit event names in a string.
   * `" "` (space) by default.
   */
  delimiter?: string;
  /**
   * Determines whether a station emits an `"all"` event for every event that is emitted.
   * `true` by default.
   */
  emitAllEvent?: boolean;
  /**
   * Determines whether a station can use delimited event names.
   * `true` by default.
   */
  enableDelimiter?: boolean;
  /**
   * Determines whether a station can use regular expression listeners.
   * `false` by default.
   */
  enableRegExp?: boolean;
  /**
   * A string used to mark regular expression listeners.
   * `"%"` by default.
   */
  regExpMarker?: string;
  [key: string]: string | boolean | undefined;
  [key: number]: undefined;
}
