import {Options} from './types/Options';

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

export function mergeOptions<T extends typeof defaultOptions>(target: any, ...sources: any[]): T;
export function mergeOptions() {
    let target = arguments[0];

    for (var i = 1; i < arguments.length; i++) {
        let source = arguments[i];

        for (let option in source) {
            let isValidOption = defaultOptions.hasOwnProperty(option);
            let value = source[option];

            if (isValidOption && value != null) {
                target[option] = value;
            }
        }
    }

    return target;
}
