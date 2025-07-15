import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../../src/main";
describe("Listeners#using()", function () {
  let context, station, listeners;
  context = undefined;
  station = undefined;
  listeners = undefined;
  beforeEach(function () {
    context = new Date();
    station = new EventStation();
    listeners = station.makeListeners("pow boom bash", function () {});
  });
  it("must set the context of the listeners", function () {
    let listener;
    listeners.using(context);
    listener = listeners.get(0);
    expect(listener.context).toBe(context);
  });
  it("must set the matching context of the listeners", function () {
    let listener;
    listeners.using(context);
    listener = listeners.get(0);
    expect(listener.matchContext).toBe(context);
  });
});
