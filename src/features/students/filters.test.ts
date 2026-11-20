import { describe, expect, it } from "vitest";
import { parseStudentFilters } from "./filters";

describe("parseStudentFilters", () => {
  it("returns no filters when the URL has none", () => {
    expect(parseStudentFilters({})).toEqual({ grade: null, status: null });
  });

  it("reads a valid grade and status", () => {
    expect(parseStudentFilters({ grade: "10", status: "inactive" })).toEqual({
      grade: 10,
      status: "inactive",
    });
  });

  it("ignores a grade outside 1-13 or not a whole number", () => {
    expect(parseStudentFilters({ grade: "0" }).grade).toBeNull();
    expect(parseStudentFilters({ grade: "14" }).grade).toBeNull();
    expect(parseStudentFilters({ grade: "10.5" }).grade).toBeNull();
    expect(parseStudentFilters({ grade: "abc" }).grade).toBeNull();
  });

  it("ignores an unknown status", () => {
    expect(parseStudentFilters({ status: "deleted" }).status).toBeNull();
  });

  it("works with URLSearchParams too", () => {
    expect(parseStudentFilters(new URLSearchParams("grade=11&status=active"))).toEqual({
      grade: 11,
      status: "active",
    });
  });
});
