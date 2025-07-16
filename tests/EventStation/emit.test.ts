import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../src/main";
describe("EventStation#emit()", function () {
  let station: EventStation<{
    bam: (this: { foo: string }) => void;
    "name with spaces": () => void;
    pow: () => void;
    woosh: () => void;
    boom: (value: number) => void;
    multipleArgs: (first: boolean, second: Date) => void;
  }>;

  beforeEach(function () {
    station = new EventStation();
  });

  it("must apply the listener once", function () {
    let applied = 0;

    station.on("bam", function () {
      applied++;
    });

    station.emit("bam");

    expect(applied).toBe(1);
  });

  it("must emit three events delimited by spaces", function () {
    let applied = 0;

    station.on("all", function () {
      applied++;
    });

    station.emit("name with spaces");

    expect(applied).toBe(3);
  });

  it("must emit one event with spaces when the delimiter is disabled", function () {
    let applied = 0;

    station.stationMeta.enableDelimiter = false;

    station.on("name with spaces", function () {
      applied++;
    });

    station.emit("name with spaces");

    expect(applied).toBe(1);
  });

  it("must apply the callback twice", function () {
    let applied = 0;

    station.on("all", function () {
      applied++;
    });

    station.emit(["pow", "woosh"]);

    expect(applied).toBe(2);
  });

  it("must call the callback with `3` as the first argument", function () {
    let arg: number | undefined;

    station.on("boom", function (value) {
      arg = value;
    });

    station.emit("boom", 3);

    expect(arg).toBe(3);
  });

  it("must set the context with `foo` as a property of `this`", function () {
    let context: any = undefined;

    station.on(
      "bam",
      function () {
        context = this;
      },
      {
        foo: "bar",
      }
    );

    station.emit("bam");

    expect(context!.foo).toBe("bar");
  });

  it("must throw an error when an invalid argument is given", function () {
    let check;

    station.on("bam");

    check = function () {
      // @ts-expect-error Invalid argument
      station.emit(undefined);
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

  it("must provide multiple arguments to the callback", function () {
    let first: boolean | undefined = undefined;
    let second: Date | undefined = undefined;

    station.on("multipleArgs", function (f, s) {
      first = f;
      second = s;
    });

    station.emit("multipleArgs", true, new Date());

    expect(first!).toBe(true);
    expect(second!).toBeInstanceOf(Date);
  });
});

describe("EventStation#emit()", function () {
  let station: EventStation<{
    boom: (
      bang: string,
      pow?: string,
      bash?: string,
      Kablammo?: string
    ) => void;
  }>;
  let bang: string;
  let pow: string;
  let bash: string;
  let Kablammo: string;

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

describe("EventStation#emit()", () => {
  let station: EventStation<{
    foo: () => string | number | Promise<string | number>;
  }>;

  beforeEach(() => {
    station = new EventStation();
  });

  it("returns an array of returned values from listeners", () => {
    station.on("foo", () => "bar");
    station.on("foo", () => 42);

    const results = station.emit("foo");

    expect(results).toEqual(["bar", 42]);
  });

  it("doesn't resolve promises", async () => {
    station.on("foo", async () => "bar");
    station.on("foo", () => 42);

    const results = station.emit("foo");

    expect(results[0]).toBeInstanceOf(Promise);
    expect(await results[0]).toEqual("bar");
    expect(results[1]).toEqual(42);
  });
});
