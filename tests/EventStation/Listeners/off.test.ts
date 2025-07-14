import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";
describe("Listeners#off()", function () {
  let listeners, listeners2, station, station2;
  listeners = undefined;
  listeners2 = undefined;
  station = undefined;
  station2 = undefined;
  beforeEach(function () {
    station = new EventStation();
    station2 = new EventStation();
    listeners = station.on("boom", function () {});
    listeners2 = station.on("bam", function () {});
  });
  it("must remove listeners", function () {
    listeners.off();
    expect(station.listenerCount).toBe(1);
  });
  it("must remove listeners from all stations", function () {
    listeners.addTo(station2);
    expect(station2.listenerCount).toBe(1);
    listeners.off();
    expect(station2.listenerCount).toBe(0);
  });
  it("must not error with listeners that aren't attached to any stations", function () {
    let check;
    check = function () {
      listeners.off();
      listeners.off();
    };
    expect(check).not.toThrow();
  });
});
