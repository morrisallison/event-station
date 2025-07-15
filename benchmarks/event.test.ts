var Benchmark,
  EventEmitter,
  EventStation,
  Backbone,
  EventEmitter2,
  EventEmitter3,
  underscore,
  suite,
  backbone,
  callback,
  emitter,
  emitter2,
  emitter3,
  listeners,
  speedOptions,
  station,
  stationConfigured;

EventEmitter = require("events").EventEmitter;

EventStation = require("../dist/main").default;

Backbone = require("backbone");
EventEmitter2 = require("eventemitter2").EventEmitter2;
EventEmitter3 = require("eventemitter3");
underscore = require("underscore");
backbone = undefined;
callback = undefined;
emitter = undefined;
emitter2 = undefined;
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
      speedOptions = {
        enableRegExp: false,
        enableDelimiter: false,
        emitAllEvent: false,
      };
      station = new EventStation();
      stationConfigured = new EventStation(speedOptions);
      listeners = stationConfigured.makeListeners("foobar", callback);
      backbone = underscore.extend({}, Backbone.Events);
      emitter = new EventEmitter();
      emitter2 = new EventEmitter2();
      emitter3 = new EventEmitter3();
    })
    .add("EventEmitter", function () {
      emitter.on("foobar", callback);
      emitter.emit("foobar");
      emitter.removeAllListeners("foobar");
    })
    .add("EventEmitter2", function () {
      emitter2.on("foobar", callback);
      emitter2.emit("foobar");
      emitter2.removeAllListeners("foobar");
    })
    .add("EventEmitter3", function () {
      emitter3.on("foobar", callback);
      emitter3.emit("foobar");
      emitter3.removeAllListeners("foobar");
    })
    .add("Event-Station (unconfigured)", function () {
      station.on("foobar", callback);
      station.emit("foobar");
      station.off("foobar");
    })
    .add("Event-Station (configured)", function () {
      stationConfigured.on("foobar", callback);
      stationConfigured.emit("foobar");
      stationConfigured.off("foobar");
    })
    .add("Event-Station (listeners#removeFrom)", function () {
      var listeners;
      listeners = stationConfigured.on("foobar", callback);
      stationConfigured.emit("foobar");
      listeners.removeFrom(stationConfigured);
    })
    .add("Event-Station (listeners#detach)", function () {
      listeners.attach();
      stationConfigured.emit("foobar");
      listeners.detach();
    })
    .add("Backbone.Events", function () {
      backbone.on("foobar", callback);
      backbone.trigger("foobar");
      backbone.off("foobar");
    })
);
