import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../../src/main";
describe("Listeners#attach()", function () {
  let station, listeners;

  station = undefined;
  listeners = undefined;

  beforeEach(function () {
    station = new EventStation();
    listeners = station.makeListeners("pow boom bash", function () {});
  });

  it("must add the listeners to their origin station", function () {
    listeners.attach();
    expect(station.listenerCount).toBe(3);
  });
});
