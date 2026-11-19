"use client";

import { Suspense, type ReactNode } from "react";
import {
  createColumnHelper,
  FlexRender,
  functionalUpdate,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type RowData,
  type SortingState,
  type TableOptions,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useTableParams } from "@/components/shared/use-table-params";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseTableParams, type TableSort } from "@/lib/table-params";
import { cn } from "@/lib/utils";

type DataTableColumnMeta = {
  align?: "left" | "right";
};

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  columnMeta: {} as DataTableColumnMeta,
});

type DataTableFeatures = typeof dataTableFeatures;

export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

type DataTableProps<TData extends RowData> = {
  columns: TableOptions<DataTableFeatures, TData>["columns"];
  data: TData[];
  label: string;
  sortableColumns?: readonly string[];
  getRowId?: (row: TData) => string;
  emptyState?: ReactNode;
};

type DataTableViewProps<TData extends RowData> = DataTableProps<TData> & {
  sort: TableSort | null;
  onSortChange?: (sort: TableSort | null) => void;
  isPending?: boolean;
};

const NO_SORTABLE_COLUMNS: readonly string[] = [];

function alignClass(align: DataTableColumnMeta["align"]) {
  return align === "right" ? "text-right tabular-nums" : undefined;
}

function toSortingState(sort: TableSort | null): SortingState {
  return sort ? [sort] : [];
}

function DataTableView<TData extends RowData>({
  columns,
  data,
  label,
  sortableColumns = NO_SORTABLE_COLUMNS,
  getRowId,
  emptyState,
  sort,
  onSortChange,
  isPending = false,
}: DataTableViewProps<TData>) {
  const sorting = toSortingState(sort);

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    manualSorting: true,
    enableMultiSort: false,
    sortDescFirst: false,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting);
      onSortChange?.(next[0] ?? null);
    },
  });

  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;

  return (
    <Table
      aria-label={label}
      aria-busy={isPending}
      className={cn(
        "transition-opacity duration-150 motion-reduce:transition-none",
        isPending && "opacity-60",
      )}
    >
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const { column } = header;
              const isRight = column.columnDef.meta?.align === "right";
              const canSort = Boolean(onSortChange) && sortableColumns.includes(column.id);
              const direction = column.getIsSorted();
              const SortIcon =
                direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;

              return (
                <TableHead
                  key={header.id}
                  className={cn(isRight && "text-right")}
                  aria-sort={
                    canSort
                      ? direction === "asc"
                        ? "ascending"
                        : direction === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                >
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      type="button"
                      onClick={column.getToggleSortingHandler()}
                      className={cn(
                        "-mx-2 inline-flex h-8 items-center gap-1 rounded-md px-2 outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                        direction && "text-foreground",
                      )}
                    >
                      <FlexRender header={header} />
                      <SortIcon
                        aria-hidden
                        className={cn("size-3.5", !direction && "text-muted-foreground/60")}
                      />
                    </button>
                  ) : (
                    <FlexRender header={header} />
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length > 0 ? (
          rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id} className={alignClass(cell.column.columnDef.meta?.align)}>
                  <FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columnCount} className="h-auto p-0 whitespace-normal">
              {emptyState ?? (
                <EmptyState
                  icon={Inbox}
                  title="No results"
                  description="There's nothing to show here yet."
                  className="rounded-none border-0 bg-transparent"
                />
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function DataTableWithUrlState<TData extends RowData>(props: DataTableProps<TData>) {
  const { searchParams, setTableParams, isPending } = useTableParams();
  const { sort } = parseTableParams(searchParams, props.sortableColumns ?? NO_SORTABLE_COLUMNS);

  return (
    <DataTableView
      {...props}
      sort={sort}
      onSortChange={(nextSort) => setTableParams({ sort: nextSort })}
      isPending={isPending}
    />
  );
}

export function DataTable<TData extends RowData>(props: DataTableProps<TData>) {
  return (
    <Suspense fallback={<DataTableView {...props} sort={null} />}>
      <DataTableWithUrlState {...props} />
    </Suspense>
  );
}
