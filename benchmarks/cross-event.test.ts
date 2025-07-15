var Benchmark,
  EventStation,
  Backbone,
  underscore,
  suite,
  backbone,
  backboneListenedTo,
  callback,
  emitter,
  emitter2,
  emitter3,
  listeners,
  speedOptions,
  station,
  stationHeard,
  stationConfigured,
  stationHeardConfigured;

EventStation = require("../dist/event-station").EventStation;
Backbone = require("backbone");
underscore = require("underscore");
backbone = undefined;
backboneListenedTo = undefined;
callback = undefined;
emitter = undefined;
emitter2 = undefined;
emitter3 = undefined;
listeners = undefined;
speedOptions = undefined;
station = undefined;
stationHeard = undefined;
stationConfigured = undefined;
stationHeardConfigured = undefined;
import { runBenchmark } from "./helper";
await runBenchmark("Event and cross-emitter listening", (suite) =>
  suite
    .on("start cycle", function () {
      callback = function () {
        1 === 1;
      };
      speedOptions = {
        enableRegExp: false,
        enableDelimiter: false,
        emitAllEvent: false,
      };
      station = new EventStation();
      stationHeard = new EventStation();
      stationConfigured = new EventStation(speedOptions);
      stationHeardConfigured = new EventStation(speedOptions);
      listeners = stationConfigured.hear(
        stationHeardConfigured,
        "foobar",
        callback
      );
      listeners.detach();
      backbone = underscore.extend({}, Backbone.Events);
      backboneListenedTo = underscore.extend({}, Backbone.Events);
    })
    .add("Event-Station (unconfigured station#disregard)", function () {
      station.hear(stationHeard, "foobar", callback);
      stationHeard.emit("foobar");
      station.disregard(stationHeard, "foobar");
    })
    .add("Event-Station (station#disregard)", function () {
      stationConfigured.hear(stationHeardConfigured, "foobar", callback);
      stationHeardConfigured.emit("foobar");
      stationConfigured.disregard(stationHeardConfigured, "foobar");
    })
    .add("Event-Station (listeners#removeFrom)", function () {
      var listeners;
      listeners = stationConfigured.hear(
        stationHeardConfigured,
        "foobar",
        callback
      );
      stationHeardConfigured.emit("foobar");
      listeners.removeFrom(stationHeardConfigured);
    })
    .add("Event-Station (listeners#detach)", function () {
      listeners.attach();
      stationHeardConfigured.emit("foobar");
      listeners.detach();
    })
    .add("Backbone.Events", function () {
      backbone.listenTo(backboneListenedTo, "foobar", callback);
      backboneListenedTo.trigger("foobar");
      backbone.stopListening(backboneListenedTo, "foobar");
    })
);
