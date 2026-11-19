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

export const SAMPLE_STUDENTS: DemoStudent[] = [
  {
    id: "1",
    admissionNo: "PN-0001",
    name: "Nimal Perera",
    grade: 10,
    phone: "071 234 5678",
    fee: 2500,
    active: true,
  },
  {
    id: "2",
    admissionNo: "PN-0002",
    name: "Kamal Silva",
    grade: 11,
    phone: "077 345 6789",
    fee: 1250,
    active: true,
  },
  {
    id: "3",
    admissionNo: "PN-0003",
    name: "Sachini Fernando",
    grade: 10,
    phone: "076 456 7890",
    fee: 0,
    active: false,
  },
  {
    id: "4",
    admissionNo: "PN-0004",
    name: "Tharindu Jayasinghe",
    grade: 9,
    phone: "070 567 8901",
    fee: 2000,
    active: true,
  },
  {
    id: "5",
    admissionNo: "PN-0005",
    name: "Dilini Wickramasinghe",
    grade: 11,
    phone: "072 678 9012",
    fee: 2500,
    active: true,
  },
  {
    id: "6",
    admissionNo: "PN-0006",
    name: "Ashen Bandara",
    grade: 8,
    phone: "075 789 0123",
    fee: 1800,
    active: true,
  },
  {
    id: "7",
    admissionNo: "PN-0007",
    name: "Malsha Rathnayake",
    grade: 10,
    phone: "078 890 1234",
    fee: 1250,
    active: false,
  },
  {
    id: "8",
    admissionNo: "PN-0008",
    name: "Ravindu Herath",
    grade: 9,
    phone: "071 901 2345",
    fee: 2000,
    active: true,
  },
];

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
