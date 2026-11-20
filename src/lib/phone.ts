const LOCAL_FORMAT = /^0[1-9]\d{8}$/;
const INTERNATIONAL_FORMAT = /^(?:\+|00)?94([1-9]\d{8})$/;

export function normalizeSriLankanPhone(input: string): string | null {
  const compact = input.replace(/[\s\-().]/g, "");

  if (LOCAL_FORMAT.test(compact)) return compact;

  const international = compact.match(INTERNATIONAL_FORMAT);
  if (international) return `0${international[1]}`;

  return null;
}
