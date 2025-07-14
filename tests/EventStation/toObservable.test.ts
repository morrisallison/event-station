import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import rx from "rx";
import EventStation from "../../src/main";
describe("EventStation#toObservable()", function () {
  let action,
    actionApplied,
    complete,
    completeApplied,
    error,
    errorApplied,
    station;
  action = undefined;
  actionApplied = undefined;
  complete = undefined;
  completeApplied = undefined;
  error = undefined;
  errorApplied = undefined;
  station = undefined;
  beforeEach(function () {
    EventStation.inject("rx", rx);
    station = new EventStation();
    actionApplied = 0;
    errorApplied = 0;
    completeApplied = 0;
    action = function (x) {
      actionApplied++;
    };
    error = function (err) {
      errorApplied++;
    };
    complete = function () {
      completeApplied++;
    };
  });
  afterEach(function () {
    EventStation.reset();
  });
  it("must throw an error if Rx has not been injected", function () {
    let check;
    EventStation.inject("rx", undefined);
    check = function () {
      station.toObservable("boom");
    };
    expect(check).toThrow(Error);
  });
  it("must create a working Rx observable", function () {
    let source, subscription;
    source = station.toObservable("boom");
    subscription = source.subscribe(action, error, complete);
    station.emit("boom");
    expect(actionApplied).toBe(1);
    subscription.dispose();
  });
});
