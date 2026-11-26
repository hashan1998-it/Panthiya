const ROW_HEIGHT = 40;
const COLUMNS_HEIGHT = 288;

export function chartHeight(layout: "columns" | "rows", rowCount: number) {
  return layout === "rows" ? rowCount * ROW_HEIGHT + 32 : COLUMNS_HEIGHT;
}
