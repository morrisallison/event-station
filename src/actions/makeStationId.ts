/** Iterator for generating unique station IDs */
let stationIdIterator: number = 0;

/** Generates a unique ID for EventStation instances */
export function makeStationId(): string {
  return String(++stationIdIterator);
}
