export const TEMP_PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
export const TEMP_PASSWORD_LENGTH = 12;

const MAX_UNBIASED_BYTE = 256 - (256 % TEMP_PASSWORD_ALPHABET.length);

export function generateTempPassword(length = TEMP_PASSWORD_LENGTH) {
  let password = "";

  while (password.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte >= MAX_UNBIASED_BYTE) continue;
      password += TEMP_PASSWORD_ALPHABET[byte % TEMP_PASSWORD_ALPHABET.length];
      if (password.length === length) break;
    }
  }

  return password;
}
