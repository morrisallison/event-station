import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";
describe("Listeners#forEach()", function () {
  let station, listeners;
  station = undefined;
  listeners = undefined;
  beforeEach(function () {
    station = new EventStation();
    listeners = station.on("pow boom bash", function () {});
  });
  it("must provide an array to the callback", function () {
    listeners.forEach(function (listener, index, arr) {
      expect(arr).toBeArray();
    });
  });
  it("must apply the callback for each listener", function () {
    let called;
    called = 0;
    listeners.forEach(function (listener, index, arr) {
      called++;
    });
    expect(called).toBe(3);
  });
  it("must provide the listener's index", function () {
    listeners.forEach(function (listener, index, arr) {
      expect(listeners.get(index)).toBe(listener);
    });
  });
});
