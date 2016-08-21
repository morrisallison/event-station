/** Container for global configuration options */
export const defaultOptions = {
    delimiter: ' ',
    emitAllEvent: true,
    enableDelimiter: true,
    enableRegExp: false,
    regExpMarker: '%',
};

/** Container for global configuration options */
export const globalOptions = mergeOptions({}, defaultOptions);

/** Resets the global configuration to defaults */
export function reset(): void {
    mergeOptions(globalOptions, defaultOptions)
}

/** Modifies the default global configuration */
export function config(opts: Options): void {
    let testOptions = mergeOptions({}, globalOptions, opts);

    assertOptions(testOptions);

    mergeOptions(globalOptions, opts);
}

/**
 * Validates the given options
 * @throws Error
 */
export function assertOptions<T extends typeof defaultOptions>(opts: T) {
    if (opts.delimiter === '') {
        throw new Error("Invalid option: Delimiters can't be empty strings.");
    }

    if (opts.regExpMarker === '') {
        throw new Error("Invalid option: RegExp markers can't be empty strings.");
    }

    if (opts.regExpMarker && opts.delimiter && opts.regExpMarker.indexOf(opts.delimiter) >= 0) {
        throw new Error("Invalid option: RegExp markers can't contain the delimiter string.");
    }
}

export function mergeOptions<T extends typeof defaultOptions>(target: any, ...sources: any[]): T {

    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (let option in defaultOptions) {
            let isValidOption = defaultOptions.hasOwnProperty(option);
            let value = source[option];

            if (isValidOption && value != null) {
                target[option] = value;
            }
        }
    }

    return target;
}

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
    [key: string]: string | boolean | void;
    [key: number]: void;
}