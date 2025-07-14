import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";
describe("Listeners#resume()", function () {
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
    listeners.pause();
  });
  it("must un-pause the listeners", function () {
    expect(listeners.isPaused()).toBe(true);
    listeners.resume();
    expect(listeners.isPaused()).toBe(false);
  });
  it("allow the listeners to be applied", function () {
    station.emit("boom");
    expect(timesApplied).toBe(0);
    listeners.resume();
    station.emit("boom");
    expect(timesApplied).toBe(1);
  });
});
