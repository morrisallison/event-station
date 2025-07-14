import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";
describe("Listeners#detach()", function () {
  let station, listeners;
  station = undefined;
  listeners = undefined;
  beforeEach(function () {
    station = new EventStation();
    listeners = station.on("pow boom bash", function () {});
  });
  it("must remove the listeners to their origin station", function () {
    listeners.detach();
    expect(station.listenerCount).toBe(0);
  });
});
