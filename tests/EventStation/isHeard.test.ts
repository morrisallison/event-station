import { expect } from "bun:test";
import { beforeAll, describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../src/main";
describe("EventStation#isHeard()", function () {
  let teacher, student;
  teacher = undefined;
  student = undefined;
  beforeEach(function () {
    teacher = new EventStation();
    student = new EventStation();
  });
  it("must determine whether the station is being heard any other stations", function () {
    expect(teacher.isHeard()).toBe(false);
    student.hear(teacher, "lecturing", function () {});
    expect(teacher.isHeard()).toBe(true);
  });
  it("must determine whether the station is being heard on specific events", function () {
    student.hear(teacher, "lecturing", function () {});
    expect(teacher.isHeard("lecturing")).toBe(true);
  });
  it("must determine whether the station is not being heard on specific events", function () {
    student.hear(teacher, "lecturing", function () {});
    expect(teacher.isHeard("talk")).toBe(false);
  });
  it("must determine whether the station is being heard by specific callbacks", function () {
    let callback;
    callback = function () {};
    student.hear(teacher, "lecturing", callback);
    expect(teacher.isHeard("lecturing", callback)).toBe(true);
  });
  it("must determine whether the station is not being heard by specific callbacks", function () {
    student.hear(teacher, "lecturing", function () {});
    expect(teacher.isHeard("lecturing", function () {})).toBe(false);
  });
  it("must determine whether the station is being heard by specific context", function () {
    let callback, context;
    callback = function () {};
    context = new Date();
    student.hear(teacher, "lecturing", callback, context);
    expect(teacher.isHeard("lecturing", callback, context)).toBe(true);
  });
  it("must determine whether the station is not being heard by specific context", function () {
    let callback, context;
    callback = function () {};
    context = new Date();
    student.hear(teacher, "lecturing", callback, context);
    expect(teacher.isHeard("lecturing", callback, new Date())).toBe(false);
  });
});
