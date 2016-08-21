/** Iterator for generating unique station IDs */
var stationIdIterator: number = 0;

/** Generates a unique ID for EventStation instances */
export function makeStationId(): string {
    return String(++stationIdIterator);
}
