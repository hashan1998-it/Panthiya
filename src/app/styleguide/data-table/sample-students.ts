import type { TableSort } from "@/lib/table-params";

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
