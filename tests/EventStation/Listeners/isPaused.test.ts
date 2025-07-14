import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";
describe("Listeners#isPaused()", function () {
  let station, listeners;
  station = undefined;
  listeners = undefined;
  beforeEach(function () {
    station = new EventStation();
    listeners = station.on("pow boom bash", function () {});
  });
  it("must determine whether a listener is paused", function () {
    listeners.pause();
    expect(listeners.isPaused()).toBe(true);
  });
  it("must determine whether a listener is not paused", function () {
    listeners.pause();
    listeners.resume();
    expect(listeners.isPaused()).toBe(false);
  });
});
