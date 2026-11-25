import { describe, expect, it } from "vitest";
import { csvResponse, toCsv, toCsvField } from "./csv";

describe("toCsvField", () => {
  it("leaves plain text and numbers as they are", () => {
    expect(toCsvField("Nimal Perera")).toBe("Nimal Perera");
    expect(toCsvField(2500.5)).toBe("2500.5");
    expect(toCsvField(-120)).toBe("-120");
  });

  it("writes nothing for a missing value", () => {
    expect(toCsvField(null)).toBe("");
    expect(toCsvField(undefined)).toBe("");
  });

  it("quotes commas, quotes and line breaks, doubling inner quotes", () => {
    expect(toCsvField("Maths, Science")).toBe('"Maths, Science"');
    expect(toCsvField('Kasun "KB" Bandara')).toBe('"Kasun ""KB"" Bandara"');
    expect(toCsvField("line one\nline two")).toBe('"line one\nline two"');
  });

  it("quotes leading or trailing spaces so they are kept", () => {
    expect(toCsvField(" padded ")).toBe('" padded "');
  });

  it("keeps Sinhala text as it is", () => {
    expect(toCsvField("නිමල් පෙරේරා")).toBe("නිමල් පෙරේරා");
  });

  it("stops text that looks like a formula from running in a spreadsheet", () => {
    expect(toCsvField("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)");
    expect(toCsvField("+94771234567")).toBe("'+94771234567");
    expect(toCsvField("@cmd")).toBe("'@cmd");
    expect(toCsvField("-1,2")).toBe('"\'-1,2"');
  });
});

describe("toCsv", () => {
  it("starts with a UTF-8 BOM and ends every line with CRLF", () => {
    const csv = toCsv(
      ["Name", "Classes"],
      [
        ["නිමල්", "Maths, Science"],
        ["Kasun", null],
      ],
    );

    expect(csv).toBe('﻿Name,Classes\r\nනිමල්,"Maths, Science"\r\nKasun,\r\n');
  });

  it("writes only the header when there are no rows", () => {
    expect(toCsv(["A", "B"], [])).toBe("﻿A,B\r\n");
  });
});

describe("csvResponse", () => {
  it("sends the CSV as a UTF-8 download with the file name", async () => {
    const response = csvResponse(toCsv(["A"], [["x"]]), "students-2026-11-25.csv");

    expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="students-2026-11-25.csv"',
    );
    expect(new Uint8Array(await response.arrayBuffer()).slice(0, 3)).toEqual(
      new Uint8Array([0xef, 0xbb, 0xbf]),
    );
  });
});
