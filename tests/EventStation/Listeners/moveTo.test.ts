import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../../src/main";
describe("Listeners#moveTo()", function () {
  let station, station2, listeners;
  station = undefined;
  station2 = undefined;
  listeners = undefined;
  beforeEach(function () {
    station = new EventStation();
    station2 = new EventStation();
    listeners = station.on("pow boom bash", function () {});
  });
  it("must add the listeners to the given station", function () {
    listeners.moveTo(station2);
    expect(station.listenerCount).toBe(0);
  });
  it("must remove the listeners from the origin station", function () {
    listeners.moveTo(station2);
    expect(station2.listenerCount).toBe(3);
  });
});
