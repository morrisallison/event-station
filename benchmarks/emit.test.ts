var Benchmark,
  EventEmitter,
  EventStation,
  Backbone,
  EventEmitter2,
  EventEmitter3,
  underscore,
  suite,
  callback,
  context,
  speedOptions,
  station,
  station2,
  backbone,
  emitter,
  emitter2,
  emitter3;

EventEmitter = require("events").EventEmitter;
EventStation = require("../dist/event-station").EventStation;
Backbone = require("backbone");
EventEmitter2 = require("eventemitter2").EventEmitter2;
EventEmitter3 = require("eventemitter3");
underscore = require("underscore");
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
station2 = new EventStation(speedOptions);
backbone = underscore.extend({}, Backbone.Events);
emitter = new EventEmitter();
emitter2 = new EventEmitter2();
emitter3 = new EventEmitter3();
emitter.on("foobar", callback);
emitter2.on("foobar", callback);
emitter3.on("foobar", callback);
station.on("foobar", callback);
station2.on("foobar", callback);
backbone.on("foobar", callback);
import { runBenchmark } from "./helper";
await runBenchmark("Event and cross-emitter listening", (suite) =>
  suite
    .add("EventEmitter", function () {
      emitter.emit("foobar");
    })
    .add("EventEmitter2 ", function () {
      emitter2.emit("foobar");
    })
    .add("EventEmitter3 ", function () {
      emitter3.emit("foobar");
    })
    .add("Event-Station", function () {
      station.emit("foobar");
    })
    .add("Event-Station (configured)", function () {
      station2.emit("foobar");
    })
    .add("Backbone.Events ", function () {
      backbone.trigger("foobar");
    })
);
