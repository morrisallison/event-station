import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../../src/main";
describe("Listeners#index()", function () {
  let station, listeners;
  station = undefined;
  listeners = undefined;
  beforeEach(function () {
    station = new EventStation();
    listeners = station.on("pow boom bash", function () {});
  });
  it("must retrieve the index of the given listener", function () {
    let listener;
    listener = listeners.get(1);
    expect(listeners.index(listener)).toBe(1);
  });
  it("must return `undefined` when the given listener isn't found", function () {
    let listener;
    listener = listeners.index({});
    expect(listener).toBeUndefined();
  });
});
