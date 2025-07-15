var Benchmark,
  EventStation,
  Backbone,
  EventEmitter3,
  underscore,
  suite,
  backbone,
  callback,
  context,
  emitter3,
  listeners,
  speedOptions,
  station,
  stationConfigured;

EventStation = require("../dist/event-station").EventStation;

Backbone = require("backbone");
EventEmitter3 = require("eventemitter3");
underscore = require("underscore");
backbone = undefined;
callback = undefined;
context = undefined;
emitter3 = undefined;
listeners = undefined;
speedOptions = undefined;
station = undefined;
stationConfigured = undefined;
import { runBenchmark } from "./helper";
await runBenchmark("Event only", (suite) =>
  suite
    .on("start cycle", function () {
      callback = function () {
        1 === 1;
      };
      context = new Date();
      speedOptions = {
        enableRegExp: false,
        enableDelimiter: false,
        emitAllEvent: false,
      };
      station = new EventStation();
      stationConfigured = new EventStation(speedOptions);
      listeners = stationConfigured.makeListeners("foobar", callback, context);
      backbone = underscore.extend({}, Backbone.Events);
      emitter3 = new EventEmitter3();
    })
    .add("EventEmitter3", function () {
      emitter3.on("foobar", callback, context);
      emitter3.emit("foobar");
      emitter3.removeAllListeners("foobar", callback, context);
    })
    .add("Event-Station (unconfigured)", function () {
      station.on("foobar", callback, context);
      station.emit("foobar");
      station.off("foobar", callback, context);
    })
    .add("Event-Station (configured)", function () {
      stationConfigured.on("foobar", callback, context);
      stationConfigured.emit("foobar");
      stationConfigured.off("foobar", callback, context);
    })
    .add("Event-Station (listeners#removeFrom)", function () {
      var listeners;
      listeners = stationConfigured.on("foobar", callback, context);
      stationConfigured.emit("foobar");
      listeners.removeFrom(stationConfigured);
    })
    .add("Event-Station (listeners#detach)", function () {
      listeners.attach();
      stationConfigured.emit("foobar");
      listeners.detach();
    })
    .add("Backbone.Events", function () {
      backbone.on("foobar", callback, context);
      backbone.trigger("foobar");
      backbone.off("foobar", callback, context);
    })
);
