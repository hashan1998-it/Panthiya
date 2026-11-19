"use client";

import { Suspense, type ReactNode } from "react";
import {
  createColumnHelper,
  FlexRender,
  functionalUpdate,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type PaginationState,
  type RowData,
  type SortingState,
  type TableOptions,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useTableParams } from "@/components/shared/use-table-params";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_PAGE_SIZE,
  getPageInfo,
  PAGE_SIZE_OPTIONS,
  parseTableParams,
  type PageInfo,
  type TableParamsChange,
  type TableSort,
} from "@/lib/table-params";
import { cn } from "@/lib/utils";

type DataTableColumnMeta = {
  align?: "left" | "right";
};

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
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
  rowCount?: number;
  sortableColumns?: readonly string[];
  getRowId?: (row: TData) => string;
  emptyState?: ReactNode;
};

type DataTableViewProps<TData extends RowData> = DataTableProps<TData> & {
  sort: TableSort | null;
  page: number;
  pageSize: number;
  onChange?: (change: TableParamsChange) => void;
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
  rowCount,
  sortableColumns = NO_SORTABLE_COLUMNS,
  getRowId,
  emptyState,
  sort,
  page,
  pageSize,
  onChange,
  isPending = false,
}: DataTableViewProps<TData>) {
  const sorting = toSortingState(sort);
  const pageInfo = rowCount === undefined ? null : getPageInfo(rowCount, page, pageSize);
  const pagination: PaginationState = {
    pageIndex: (pageInfo?.page ?? 1) - 1,
    pageSize,
  };

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    manualSorting: true,
    enableMultiSort: false,
    sortDescFirst: false,
    manualPagination: true,
    autoResetPageIndex: false,
    rowCount,
    state: { sorting, pagination },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting);
      onChange?.({ sort: next[0] ?? null });
    },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination);
      if (next.pageSize !== pagination.pageSize) {
        onChange?.({ pageSize: next.pageSize });
      } else {
        onChange?.({ page: next.pageIndex + 1 });
      }
    },
  });

  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;

  return (
    <div className="flex flex-col gap-4">
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
                const canSort = Boolean(onChange) && sortableColumns.includes(column.id);
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
                  <TableCell
                    key={cell.id}
                    className={alignClass(cell.column.columnDef.meta?.align)}
                  >
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
      {pageInfo && rowCount !== undefined && onChange && (
        <DataTablePagination
          pageInfo={pageInfo}
          rowCount={rowCount}
          pageSize={pageSize}
          canPrevious={table.getCanPreviousPage()}
          canNext={table.getCanNextPage()}
          onPrevious={() => table.previousPage()}
          onNext={() => table.nextPage()}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      )}
    </div>
  );
}

type DataTablePaginationProps = {
  pageInfo: PageInfo;
  rowCount: number;
  pageSize: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPageSizeChange: (size: number) => void;
};

function DataTablePagination({
  pageInfo,
  rowCount,
  pageSize,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  onPageSizeChange,
}: DataTablePaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-4 text-body-sm text-muted-foreground md:flex-row md:items-center md:justify-between"
    >
      <p className="tabular-nums">
        Showing {pageInfo.from}–{pageInfo.to} of {rowCount}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          Rows per page
          <span className="relative inline-flex">
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-10 cursor-pointer appearance-none rounded-lg border border-input bg-background pr-9 pl-3 text-foreground tabular-nums transition-colors duration-150 outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none dark:scheme-dark"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </span>
        </label>
        <p aria-live="polite" className="tabular-nums">
          Page {pageInfo.page} of {pageInfo.pageCount}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!canPrevious} onClick={onPrevious}>
            <ChevronLeft data-icon="inline-start" aria-hidden />
            Previous
          </Button>
          <Button variant="outline" disabled={!canNext} onClick={onNext}>
            Next
            <ChevronRight data-icon="inline-end" aria-hidden />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function DataTableWithUrlState<TData extends RowData>(props: DataTableProps<TData>) {
  const { searchParams, setTableParams, isPending } = useTableParams();
  const params = parseTableParams(searchParams, props.sortableColumns ?? NO_SORTABLE_COLUMNS);

  return (
    <DataTableView
      {...props}
      sort={params.sort}
      page={params.page}
      pageSize={params.pageSize}
      onChange={setTableParams}
      isPending={isPending}
    />
  );
}

export function DataTable<TData extends RowData>(props: DataTableProps<TData>) {
  return (
    <Suspense
      fallback={<DataTableView {...props} sort={null} page={1} pageSize={DEFAULT_PAGE_SIZE} />}
    >
      <DataTableWithUrlState {...props} />
    </Suspense>
  );
}
