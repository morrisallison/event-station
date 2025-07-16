/**
 * @see [Configuration documentation](https://github.com/morrisallison/event-station/blob/main/docs/Usage.md#configuration)
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
}
