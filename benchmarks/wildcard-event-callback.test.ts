var Benchmark,
  EventStation,
  EventEmitter2,
  suite,
  callback,
  emitter2,
  listeners,
  listenersMiddle,
  speedOptions,
  station,
  stationConfigured;

EventStation = require("../dist/event-station").EventStation;
EventEmitter2 = require("eventemitter2").EventEmitter2;
callback = undefined;
emitter2 = undefined;
listeners = undefined;
listenersMiddle = undefined;
speedOptions = undefined;
station = undefined;
stationConfigured = undefined;
import { runBenchmark } from "./helper";
await runBenchmark("Wildcard, event, and callback", (suite) =>
  suite
    .on("start cycle", function () {
      callback = function () {
        1 === 1;
      };
      speedOptions = {
        enableRegExp: true,
        enableDelimiter: false,
        emitAllEvent: false,
      };
      emitter2 = new EventEmitter2({
        wildcard: true,
      });
      station = new EventStation({
        enableRegExp: true,
      });
      stationConfigured = new EventStation(speedOptions);
      listeners = stationConfigured.makeListeners("%^foo/bar/[^/]+", callback);
      listenersMiddle = stationConfigured.makeListeners(
        "%^foo/[^/]+/1",
        callback
      );
    })
    .add("EventEmitter2 ", function () {
      emitter2.on("foo.bar.*", callback);
      emitter2.emit("foo.bar.1");
      emitter2.off("foo.bar.*", callback);
    })
    .add("EventEmitter2 (middle wildcard)", function () {
      emitter2.on("foo.*.1", callback);
      emitter2.emit("foo.bar.1");
      emitter2.off("foo.*.1", callback);
    })
    .add("Event-Station (unconfigured) ", function () {
      station.on("%^foo/bar/[^/]+", callback);
      station.emit("foo/bar/1");
      station.off("%^foo/bar/[^/]+", callback);
    })
    .add("Event-Station (unconfigured middle wildcard)", function () {
      station.on("%^foo/[^/]+/1", callback);
      station.emit("foo/bar/1");
      station.off("%^foo/[^/]+/1", callback);
    })
    .add("Event-Station", function () {
      var listeners;
      listeners = stationConfigured.on("%^foo/bar/[^/]+", callback);
      stationConfigured.emit("foo/bar/1");
      listeners.removeFrom(stationConfigured);
    })
    .add("Event-Station (middle wildcard)", function () {
      var listeners;
      listeners = stationConfigured.on("%^foo/[^/]+/1", callback);
      stationConfigured.emit("foo/bar/1");
      listeners.removeFrom(stationConfigured);
    })
    .add("Event-Station (listeners#detach)", function () {
      listeners.attach();
      stationConfigured.emit("foo/bar/1");
      listeners.detach();
    })
    .add("Event-Station (listeners#detach middle wildcard)", function () {
      listenersMiddle.attach();
      stationConfigured.emit("foo/bar/1");
      listenersMiddle.detach();
    })
);
