import crypto from "crypto";
import envConfig from "./envConfig";
import bcrypt from "bcryptjs";

const cryptSecret: string = envConfig.CRYPT_SECRET;
const cryptIvLen = 16;
const cryptAlgo = "aes-256-cbc";

// Encryption

export function encrypt(val: string, secret: string = cryptSecret): string {
  if (!secret) {
    throw new Error(
      "Encryption secret is not set. Make sure CRYPT_SECRET is defined in environment variables."
    );
  }

  const iv = crypto.randomBytes(cryptIvLen);
  const cipher = crypto.createCipheriv(
    cryptAlgo,
    Buffer.from(secret, "utf8"),
    iv
  );
  let encrypted = cipher.update(val);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + encrypted.toString("hex");
}

export function decrypt(val: string, secret: string = cryptSecret): string {
  if (!secret) {
    throw new Error(
      "Decryption secret is not set. Make sure CRYPT_SECRET is defined in environment variables."
    );
  }

  const iv = Buffer.from(val.substring(0, cryptIvLen * 2), "hex");
  const encrypted = Buffer.from(val.substring(cryptIvLen * 2), "hex");

  const decipher = crypto.createDecipheriv(
    cryptAlgo,
    Buffer.from(secret, "utf8"),
    iv
  );
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export const hashWithSHA256 = (val: string): string => {
  return crypto.createHash("sha256").update(val).digest("hex");
};

export const hashWithBcrypt = async (val: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(val, salt);
  return hashed;
};

// Reformating

export const capitalizeFirstLetter = (word: string): string => {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export const capitalizeAfterSpaceAndHyphen = (val: string): string => {
  return val
    .split(" ")
    .map((segment) => segment.split("-").map(capitalizeFirstLetter).join("-"))
    .join(" ");
};
