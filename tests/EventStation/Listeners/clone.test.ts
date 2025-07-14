import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";
describe("Listeners#clone()", function () {
  let callback, clones, context, listeners, station, station2;
  callback = undefined;
  clones = undefined;
  context = undefined;
  listeners = undefined;
  station = undefined;
  station2 = undefined;
  beforeEach(function () {
    station = new EventStation();
    station2 = new EventStation();
    context = new Date();
    callback = function () {};
    listeners = station.on("boom pow bam", callback, context);
  });
  it("must return a new `Listeners` object", function () {
    clones = listeners.clone();
    expect(clones).not.toBe(listeners);
  });
  it("must create new listeners", function () {
    let listener, clone;
    clones = listeners.clone();
    listener = listeners.get(0);
    clone = clones.get(0);
    expect(clone).not.toBe(listener);
  });
  it("must copy the listener's event name", function () {
    let listener, clone;
    clones = listeners.clone();
    listener = listeners.get(1);
    clone = clones.get(1);
    expect(clone.eventName).toBe(listener.eventName);
  });
  it("must copy the listener's callback", function () {
    let listener, clone;
    clones = listeners.clone();
    listener = listeners.get(2);
    clone = clones.get(2);
    expect(clone.callback).toBe(listener.callback);
  });
  it("must copy the listener's context", function () {
    let listener, clone;
    clones = listeners.clone();
    listener = listeners.get(0);
    clone = clones.get(0);
    expect(clone.context).toBe(listener.context);
  });
  it("must copy the listener's matching callback", function () {
    let listener, clone;
    clones = listeners.clone();
    listener = listeners.get(1);
    clone = clones.get(1);
    expect(clone.matchCallback).toBe(listener.matchCallback);
  });
  it("must copy the listener's matching context", function () {
    let listener, clone;
    clones = listeners.clone();
    listener = listeners.get(2);
    clone = clones.get(2);
    expect(clone.matchContext).toBe(listener.matchContext);
  });
  it("must copy the listener's paused state", function () {
    let listener, clone;
    clones = listeners.clone();
    listener = listeners.get(0);
    clone = clones.get(0);
    expect(clone.isPaused).toBe(listener.isPaused);
  });
  it("must copy the listener's number of occurrences", function () {
    let listener, clone;
    clones = listeners.clone();
    listener = listeners.get(1);
    clone = clones.get(1);
    expect(clone.occurrences).toBe(listener.occurrences);
  });
  it("must copy the listener's occurrence limit", function () {
    let listener, clone;
    clones = listeners.clone();
    listener = listeners.get(2);
    clone = clones.get(2);
    expect(clone.maxOccurrences).toBe(listener.maxOccurrences);
  });
  it("must clone the same number of listeners", function () {
    clones = listeners.clone();
    expect(clones.count).toBe(3);
  });
  it("must assign an origin station", function () {
    expect(clones.originStation).toBeObject();
  });
  it("must throw an error when cloning cross-emitter listeners", function () {
    let listeners, check;
    listeners = station.hear(station2, "bash", callback, context);
    check = function () {
      listeners.clone();
    };
    expect(check).toThrow(Error);
  });
});
