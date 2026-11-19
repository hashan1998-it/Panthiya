import { z } from "zod";
import { readParam, type RawSearchParams, type TableSort } from "@/lib/table-params";

export type DemoStudent = {
  id: string;
  admissionNo: string;
  name: string;
  grade: number;
  phone: string;
  fee: number;
  active: boolean;
};

export const DEMO_SORTABLE_COLUMNS = ["admissionNo", "name", "grade", "fee"] as const;

type SortableKey = (typeof DEMO_SORTABLE_COLUMNS)[number];

const FIRST_NAMES = [
  "Nimal",
  "Kamal",
  "Sachini",
  "Tharindu",
  "Dilini",
  "Ashen",
  "Malsha",
  "Ravindu",
  "Hiruni",
  "Kasun",
];
const SURNAMES = ["Perera", "Silva", "Fernando"];
const FEES = [2500, 1250, 0, 2000, 1800];

export const SAMPLE_STUDENTS: DemoStudent[] = SURNAMES.flatMap((surname, s) =>
  FIRST_NAMES.map((firstName, f) => {
    const n = s * FIRST_NAMES.length + f + 1;
    return {
      id: String(n),
      admissionNo: `PN-${String(n).padStart(4, "0")}`,
      name: `${firstName} ${surname}`,
      grade: 6 + (n % 6),
      phone: `07${n % 9} ${String(100 + n).padStart(3, "0")} ${String(4000 + n * 7)}`,
      fee: FEES[n % FEES.length],
      active: n % 7 !== 0,
    };
  }),
);

export const DEMO_GRADES = [6, 7, 8, 9, 10, 11] as const;
export const DEMO_STATUSES = ["active", "inactive"] as const;

export type DemoFilters = {
  grade?: number;
  status?: (typeof DEMO_STATUSES)[number];
};

const gradeSchema = z.coerce
  .number()
  .int()
  .refine((grade) => (DEMO_GRADES as readonly number[]).includes(grade))
  .optional()
  .catch(undefined);

const statusSchema = z.enum(DEMO_STATUSES).optional().catch(undefined);

export function parseDemoFilters(raw: RawSearchParams): DemoFilters {
  return {
    grade: gradeSchema.parse(readParam(raw, "grade")),
    status: statusSchema.parse(readParam(raw, "status")),
  };
}

export function filterStudents(students: DemoStudent[], filters: DemoFilters): DemoStudent[] {
  return students.filter(
    (student) =>
      (filters.grade === undefined || student.grade === filters.grade) &&
      (filters.status === undefined || student.active === (filters.status === "active")),
  );
}

export function searchStudents(students: DemoStudent[], q: string): DemoStudent[] {
  if (!q) return students;

  const needle = q.toLowerCase();
  return students.filter(
    (student) =>
      student.name.toLowerCase().includes(needle) ||
      student.admissionNo.toLowerCase().includes(needle),
  );
}

export function sortStudents(students: DemoStudent[], sort: TableSort | null): DemoStudent[] {
  if (!sort) return students;

  const key = sort.id as SortableKey;
  const direction = sort.desc ? -1 : 1;

  return [...students].sort((a, b) => {
    const left = a[key];
    const right = b[key];
    const result =
      typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right));
    return result * direction;
  });
}
