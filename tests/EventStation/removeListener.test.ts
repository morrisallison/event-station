import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../src/main";
describe("EventStation#removeListener()", function () {
  let callback, context, station, station2, stationMeta;
  callback = undefined;
  context = undefined;
  station = undefined;
  station2 = undefined;
  stationMeta = undefined;
  beforeEach(function () {
    callback = function () {};
    context = new Date();
    station = new EventStation();
    station2 = new EventStation();
    stationMeta = station.stationMeta;
  });
  it("must not decrement the listener count when not listeners are attached", function () {
    expect(station.listenerCount).toBe(0);
    station.removeListener({
      eventName: "boom",
    });
    expect(station.listenerCount).toBe(0);
  });
  it("must decrement the listener count when a listener is removed", function () {
    let listener;
    station.on("boom", callback, context);
    listener = {
      eventName: "boom",
      callback: callback,
      context: context,
      matchCallback: callback,
      matchContext: context,
    };
    expect(station.listenerCount).toBe(1);
    station.removeListener(listener);
    expect(station.listenerCount).toBe(0);
  });
  it("must remove the listener", function () {
    let listener;
    station.on("boom", callback, context);
    listener = {
      eventName: "boom",
      callback: callback,
      context: context,
      matchCallback: callback,
      matchContext: context,
    };
    expect(stationMeta.listenersMap.boom).not.toBeUndefined();
    station.removeListener(listener);
    expect(stationMeta.listenersMap.boom).toBeUndefined();
  });
  it("must not remove the listener based on the hearer property", function () {
    let listener;
    station2.hear(station, "boom", callback, context);
    listener = {
      eventName: "boom",
      hearer: station,
    };
    expect(stationMeta.listenersMap.boom).not.toBeUndefined();
    station.removeListener(listener);
    expect(stationMeta.listenersMap.boom).not.toBeUndefined();
  });
  it("must not remove listeners that aren't the same object, when the exact match flag is set", function () {
    let listener;
    station.on("boom", callback, context);
    listener = {
      eventName: "boom",
      callback: callback,
      context: context,
      matchCallback: callback,
      matchContext: context,
    };
    expect(stationMeta.listenersMap.boom).not.toBeUndefined();
    station.removeListener(listener, true);
    expect(stationMeta.listenersMap.boom).not.toBeUndefined();
  });
  it("must remove all instances of the same listener", function () {
    let listener;
    listener = {
      eventName: "boom",
      callback: callback,
      context: station,
      matchCallback: callback,
      matchContext: undefined,
    };

    station.addListener(listener);

    expect(station.listenerCount).toBe(1);

    station.addListener(listener);

    expect(station.listenerCount).toBe(2);
    expect(stationMeta.listenersMap.boom).toBeArray();
    expect(listener.stationMetas).toBeArray();
    expect(listener.stationMetas.length).toBe(2);
    expect(listener.stationMetas[0]).toBe(stationMeta);
    expect(listener.stationMetas[1]).toBe(stationMeta);
    expect(stationMeta.listenersMap.boom[0]).toBe(listener);
    expect(stationMeta.listenersMap.boom[1]).toBe(listener);

    station.removeListener(listener);

    expect(station.listenerCount).toBe(0);
    expect(listener.stationMetas).toBeUndefined();
  });
});
