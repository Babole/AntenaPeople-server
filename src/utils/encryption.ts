import crypto from "crypto";
import envConfig from "./envConfig";

const cryptSecret: string = envConfig.CRYPT_SECRET;
const cryptIvLen = 16;
const cryptAlgo = "aes-256-cbc";

export function encryptData(
  data: string,
  secret: string = cryptSecret
): string {
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
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + encrypted.toString("hex");
}

export function decryptData(
  data: string,
  secret: string = cryptSecret
): string {
  if (!secret) {
    throw new Error(
      "Decryption secret is not set. Make sure CRYPT_SECRET is defined in environment variables."
    );
  }

  const iv = Buffer.from(data.substring(0, cryptIvLen * 2), "hex");
  const encrypted = Buffer.from(data.substring(cryptIvLen * 2), "hex");

  const decipher = crypto.createDecipheriv(
    cryptAlgo,
    Buffer.from(secret, "utf8"),
    iv
  );
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
