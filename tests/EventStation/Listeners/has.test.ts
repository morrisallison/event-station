import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";

describe("Listeners#has()", function () {
  let callback, context, listeners, station;

  callback = undefined;
  context = undefined;
  listeners = undefined;
  station = undefined;

  beforeEach(function () {
    callback = function () {};
    context = new Date();
    station = new EventStation();
    listeners = station.on("pow boom bash", callback, context);
  });

  it("must determine that a given listener has a matching listener", function () {
    let listener;
    listener = listeners.get(0);
    expect(listeners.has(listener)).toBe(true);
  });

  it("must determine that a given object has a matching listener", function () {
    const result = listeners.has({ eventName: "boom" });

    expect(result).toBe(true);
  });

  it("must determine that a given listener has an exact match", function () {
    let listener;
    listener = listeners.get(2);
    expect(listeners.has(listener, true)).toBe(true);
  });

  it("must determine that a given object doesn't have an exact match", function () {
    const result = listeners.has({ eventName: "boom" }, true);

    expect(result).toBe(false);
  });
});
