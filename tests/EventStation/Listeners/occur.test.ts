import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";
describe("Listeners#occur()", function () {
  let station, station2, listeners, timesApplied;
  station = undefined;
  station2 = undefined;
  listeners = undefined;
  timesApplied = undefined;
  beforeEach(function () {
    station = new EventStation();
    station2 = new EventStation();
    timesApplied = 0;
    listeners = station.on("boom", function () {
      timesApplied++;
    });
  });
  it("must throw an error", function () {
    let check;
    check = function () {
      listeners.occur(0);
    };
    expect(check).toThrow(Error);
  });
  it("must restrict the listener's occurrences", function () {
    listeners.occur(3);
    expect(timesApplied).toBe(0);
    station.emit("boom");
    station.emit("boom");
    station.emit("boom");
    station.emit("boom");
    expect(timesApplied).toBe(3);
  });
  it("must remove the listener from the station", function () {
    listeners.occur(3);
    expect(station.listenerCount).toBe(1);
    station.emit("boom");
    station.emit("boom");
    station.emit("boom");
    station.emit("boom");
    expect(station.listenerCount).toBe(0);
  });
  it("must remove the listener from all stations", function () {
    listeners.addTo(station2).occur(3);
    expect(station2.listenerCount).toBe(1);
    station.emit("boom");
    station.emit("boom");
    station.emit("boom");
    station.emit("boom");
    expect(station2.listenerCount).toBe(0);
  });
});
