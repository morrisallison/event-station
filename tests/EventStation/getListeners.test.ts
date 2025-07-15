import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../src/main";
describe("EventStation#getListeners()", function () {
  let station, callback, context, listeners;
  station = undefined;
  callback = undefined;
  context = undefined;
  listeners = undefined;
  beforeEach(function () {
    station = new EventStation();
    callback = function () {};
    context = new Date();
    listeners = station.on("pow boom bash", callback, context);
  });
  it("must return undefined if no listeners are attached to the station", function () {
    listeners.off();
    expect(station.getListeners()).toBeUndefined();
  });
  it("must retrieve all of the listeners that are attached to the station", function () {
    listeners.forEach(function (listener) {
      station.getListeners().has(listener, true);
    });
  });
  it("must a listeners object with the same count as the the station's listener count", function () {
    expect(station.getListeners().count).toBe(station.listenerCount);
  });
  it("must retrieve attached listeners that match a specific event", function () {
    expect(station.getListeners("boom").count).toBe(1);
  });
  it("must retrieve attached listeners that match a listener map", function () {
    const count = station.getListeners({ pow: callback }).count;

    expect(count).toBe(1);
  });
  it("must retrieve attached listeners that match an array of events", function () {
    expect(station.getListeners(["bash", "pow"]).count).toBe(2);
  });
  it("must return `undefined` if no matching listeners are found", function () {
    expect(station.getListeners("smash")).toBeUndefined();
  });
});
