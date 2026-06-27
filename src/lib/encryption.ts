import Cryptr from "cryptr";

let _cryptr: Cryptr | null = null;

function getCryptr(): Cryptr {
  if (!_cryptr) {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) throw new Error("ENCRYPTION_KEY environment variable is not set");
    _cryptr = new Cryptr(key);
  }
  return _cryptr;
}

export const encrypt = (text: string) => getCryptr().encrypt(text);
export const decrypt = (text: string) => getCryptr().decrypt(text);
