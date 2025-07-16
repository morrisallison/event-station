import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../src/main";

describe("EventStation#on()", function () {
  type EVT = {
    pow: () => void;
    bang: () => void;
    boom: () => void;
  };

  let callback: any;
  let context: Date;
  let station: EventStation<EVT>;
  let stationMeta: EventStation<EVT>["stationMeta"];

  beforeEach(function () {
    callback = function () {};
    context = new Date();
    station = new EventStation();
    stationMeta = station.stationMeta;
  });

  it("must increase the listener count", function () {
    station.on("boom", callback);
    expect(stationMeta.listenerCount).toBe(1);
  });

  it("must attach a listener to the listeners map", function () {
    let listener;
    station.on("boom", callback);
    listener = stationMeta.listenersMap.boom[0];
    expect(listener).toBeObject();
  });

  it("must have set the correct event name", function () {
    let listener;
    station.on("boom", callback);
    listener = stationMeta.listenersMap.boom[0];
    expect(listener.eventName).toBe("boom");
  });

  it("must have set the station as the context", function () {
    let listener;
    station.on("boom", callback);
    listener = stationMeta.listenersMap.boom[0];
    expect(listener.context).toBe(station);
  });

  it("must set no match context", function () {
    let listener;
    station.on("boom", callback);
    listener = stationMeta.listenersMap.boom[0];
    expect(listener.matchContext).toBeUndefined();
  });

  it("must have set the callback without modification", function () {
    let listener;
    station.on("boom", callback);
    listener = stationMeta.listenersMap.boom[0];
    expect(listener.callback).toBe(callback);
  });

  it("must have set the `matchCallback` without modification", function () {
    let listener;
    station.on("boom", callback);
    listener = stationMeta.listenersMap.boom[0];
    expect(listener.matchCallback).toBe(callback);
  });

  it("must attach a second listener to the station", function () {
    station.on("boom", callback);
    station.on("boom", callback, context);
    expect(stationMeta.listenerCount).toBe(2);
  });

  it("must attach a second listener to the station with the correct event name", function () {
    let listener;
    station.on("boom", callback);
    station.on("boom", callback, context);
    listener = stationMeta.listenersMap.boom[1];
    expect(listener.eventName).toBe("boom");
  });

  it("must have set the given context", function () {
    let listener;
    station.on("boom", callback, context);
    listener = stationMeta.listenersMap.boom[0];
    expect(listener.context).toBe(context);
  });

  it("must have set the given match context", function () {
    let listener;
    station.on("boom", callback, context);
    listener = stationMeta.listenersMap.boom[0];
    expect(listener.matchContext).toBe(context);
  });

  it("must have set the match callback without modification", function () {
    let listener;
    station.on("boom", callback, context);
    listener = stationMeta.listenersMap.boom[0];
    expect(listener.matchCallback).toBe(callback);
  });

  it("must add three listeners to the station with a listener map", function () {
    let listenerMap;
    listenerMap = {
      pow: function () {},
      bang: function () {},
      boom: function () {},
    };
    station.on(listenerMap);
    expect(stationMeta.listenerCount).toBe(3);
  });

  it("must add three listeners to the station with a space delimited string", function () {
    let events;
    events = "its over 9000";
    station.on(events, function () {});
    expect(stationMeta.listenerCount).toBe(3);
  });

  it("must add one listener for an event with spaces when the delimiter is disabled", function () {
    let events;
    station.stationMeta.enableDelimiter = false;
    events = "its over 9000";
    station.on(events, function () {});
    expect(stationMeta.listenerCount).toBe(1);
  });

  it("must throw an error", function () {
    const check = function () {
      // @ts-expect-error Invalid argument
      station.on(true, function () {});
    };
    expect(check).toThrow(Error);
  });

  it("must add a listener without a callback", function () {
    station.on("boom");

    const listener = stationMeta.listenersMap.boom[0];

    expect(listener.callback).toBeUndefined();
  });
});

describe("EventStation#on()", function () {
  it("can use any object as a listener map", function () {
    const station = new EventStation<Date>();
    const date = new Date(0);

    station.on(Date.prototype as any, date);

    expect(date.getFullYear()).toBe(1970);

    station.emit("setFullYear", 2025);

    expect(date.getFullYear()).toBe(2025);
  });
});
