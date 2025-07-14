import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";
describe("Listeners#isAttached()", function () {
  let station, listeners;
  station = undefined;
  listeners = undefined;
  beforeEach(function () {
    station = new EventStation();
    listeners = station.on("pow boom bash", function () {});
  });
  it("must determine that the listeners are attached", function () {
    expect(listeners.isAttached()).toBe(true);
  });
  it("must determine that the listeners aren't attached", function () {
    listeners.off();
    expect(listeners.isAttached()).toBe(false);
  });
});
