import { expect, describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";
describe("Listeners#addTo()", function () {
  let station, station2, listeners;

  station = undefined;
  station2 = undefined;
  listeners = undefined;

  beforeEach(function () {
    station = new EventStation();
    station2 = new EventStation();
    listeners = station.hear(station2, "boom", function () {});
    expect(station2.listenerCount).toBe(1);
  });

  it("must throw an error when a cross-emitter listener is attached to a station other than its origin", function () {
    let check;
    check = function () {
      listeners.addTo(station);
    };
    expect(check).toThrow(Error);
  });

  it("must attach a cross-emitter listener to its origin station", function () {
    listeners.off();
    expect(station2.listenerCount).toBe(0);
    listeners.addTo(station2);
    expect(station2.listenerCount).toBe(1);
  });
});
