

  import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

  import EventStation from "../../src/main";
  describe('EventStation#isHearing()', function(){
    let student, parent, teacher;
    student = undefined;
    parent = undefined;
    teacher = undefined;
    beforeEach(function(){
      student = new EventStation;
      parent = new EventStation;
      teacher = new EventStation;
      student.hear(teacher, 'lecture', function(){});
    });
    it('must determine that the station is not hearing any station', function(){
      expect(teacher.isHearing()).toBe(false);
    });
    it('must determine that the station is not hearing a specific station', function(){
      expect(teacher.isHearing(student)).toBe(false);
    });
    it('must determine that the station is hearing any station', function(){
      expect(student.isHearing()).toBe(true);
    });
    it('must determine that the station is hearing a specific station', function(){
      expect(student.isHearing(teacher)).toBe(true);
    });
    it('must determine that the station is not hearing a specific station', function(){
      expect(student.isHearing(parent)).toBe(false);
    });
    it('must determine that the station is hearing a specific event for a specific station', function(){
      expect(student.isHearing(teacher, 'lecture')).toBe(true);
    });
    it('must determine that the station is not hearing a specific event for a specific station', function(){
      expect(student.isHearing(teacher, 'talk')).toBe(false);
    });
  });

