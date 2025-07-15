import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../src/main";
describe("EventStation#emit()", function () {
  let station;
  station = undefined;
  beforeEach(function () {
    station = new EventStation();
  });
  it("must apply the listener once", function () {
    let applied;
    applied = 0;
    station.on("bam", function () {
      applied++;
    });
    station.emit("bam");
    expect(applied).toBe(1);
  });
  it("must emit three events delimited by spaces", function () {
    let applied;
    applied = 0;
    station.on("all", function () {
      applied++;
    });
    station.emit("its over 9000");
    expect(applied).toBe(3);
  });
  it("must emit one event with spaces when the delimiter is disabled", function () {
    let applied;
    applied = 0;
    station.stationMeta.enableDelimiter = false;
    station.on("its over 9000", function () {
      applied++;
    });
    station.emit("its over 9000");
    expect(applied).toBe(1);
  });
  it("must apply the callback twice", function () {
    let applied;
    applied = 0;
    station.on("all", function () {
      applied++;
    });
    station.emit(["pow", "woosh"]);
    expect(applied).toBe(2);
  });
  it("must call the callback with `3` as the first argument", function () {
    let arg;
    arg = undefined;
    station.on("boom", function (value) {
      arg = value;
    });
    station.emit("boom", 3);
    expect(arg).toBe(3);
  });
  it("must set the context with `foo` as a property of `this`", function () {
    let context, callback;
    context = undefined;
    callback = function () {
      return (context = this);
    };
    station.on("bam", callback, {
      foo: "bar",
    });
    station.emit("bam");
    expect(context.foo).toBe("bar");
  });
  it("must throw an error when an invalid argument is given", function () {
    let check;
    station.on("bam");
    check = function () {
      station.emit();
    };
    expect(check).toThrow(Error);
  });
  it("must increase listener occurrences when a limit is set", function () {
    let listeners, listener;
    listeners = station.on("bam");
    listeners.occur(3);
    listener = listeners.get(0);
    expect(listener.occurrences).toBeUndefined();
    station.emit("bam");
    expect(listener.occurrences).toBe(1);
  });
});
describe("EventStation#emit()", function () {
  let station, bang, pow, bash, Kablammo;
  station = undefined;
  bang = undefined;
  pow = undefined;
  bash = undefined;
  Kablammo = undefined;
  beforeEach(function () {
    station = new EventStation();
    station.on("boom", function () {
      bang = arguments[0];
      pow = arguments[1];
      bash = arguments[2];
      Kablammo = arguments[3];
    });
  });
  it('must call the callback with "bang" as the first argument', function () {
    station.emit("boom", "bang");
    expect(bang).toBe("bang");
  });
  it('must call the callback with "pow" as the second argument', function () {
    station.emit("boom", "bang", "pow");
    expect(pow).toBe("pow");
  });
  it('must call the callback with "bash" as the third argument', function () {
    station.emit("boom", "bang", "pow", "bash");
    expect(bash).toBe("bash");
  });
  it('must call the callback with "kablammo" as the fourth argument', function () {
    station.emit("boom", "bang", "pow", "bash", "kablammo");
    expect(Kablammo).toBe("kablammo");
  });
});
describe("EventStation#emit()", function () {
  let applied, callback, station;
  applied = undefined;
  callback = undefined;
  station = undefined;
  beforeEach(function () {
    station = new EventStation({
      enableRegExp: true,
    });
    applied = 0;
    callback = function () {
      return applied++;
    };
  });
  it("must emit an event that matches the listener", function () {
    station.on("%^foo/bar/[^/]+$", callback);
    expect(applied).toBe(0);
    station.emit("foo/bar/1");
    expect(applied).toBe(1);
  });
  it("must emit an event that doesn't match the listener", function () {
    station.on("%^foo/bar/[^/]+$", callback);
    expect(applied).toBe(0);
    station.emit("foo/bar");
    expect(applied).toBe(0);
  });
  it("must emit an event that both regex listeners", function () {
    station.on("%^foo/[^/]+/1$ foo/bar/2", callback);
    expect(applied).toBe(0);
    station.emit("foo/bar/1");
    expect(applied).toBe(1);
  });
  it("must emit an event that matches a string listener", function () {
    station.on("%^foo/[^/]+/1$ foo/bar/2", callback);
    expect(applied).toBe(0);
    station.emit("foo/bar/2");
    expect(applied).toBe(1);
  });
  it("must emit an event that matches neither string nor regex listeners", function () {
    station.on("%^foo/[^/]+/1$ foo/bar/2", callback);
    expect(applied).toBe(0);
    station.emit("foo/bar/3");
    expect(applied).toBe(0);
  });
  it("must work with custom regex listener markers", function () {
    station.stationMeta.regExpMarker = "REGEX";
    station.on("REGEX^foo/bar/[^/]+$", callback);
    expect(applied).toBe(0);
    station.emit("foo/bar/1");
    expect(applied).toBe(1);
  });
});
