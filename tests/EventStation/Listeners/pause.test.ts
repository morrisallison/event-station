import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";
describe("Listeners#pause()", function () {
  let station, listeners, timesApplied;
  station = undefined;
  listeners = undefined;
  timesApplied = undefined;
  beforeEach(function () {
    station = new EventStation();
    timesApplied = 0;
    listeners = station.on("boom", function () {
      timesApplied++;
    });
  });
  it("must stop the listener from being applied", function () {
    station.emit("boom");
    listeners.pause();
    station.emit("boom");
    expect(timesApplied).toBe(1);
  });
  it("must prevent occurrence limits from increasing", function () {
    listeners.occur(3);
    expect(station.listenerCount).toBe(1);
    station.emit("boom");
    listeners.pause();
    station.emit("boom");
    station.emit("boom");
    expect(station.listenerCount).toBe(1);
  });
});
