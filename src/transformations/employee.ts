import crypto from "crypto";
import bcrypt from "bcryptjs";

import { encryptData } from "../utils/encryption";

const capitalizeFirstLetter = (word: string): string => {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

const capitalizeAfterSpaceAndHyphen = (val: string): string => {
  return val
    .split(" ")
    .map((segment) => segment.split("-").map(capitalizeFirstLetter).join("-"))
    .join(" ");
};

const hashWithSHA256 = (data: string): string => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

const hashWithBcrypt = async (val: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(val, salt);
  return hashed;
};

export const employeeTransformations = {
  cnp: hashWithSHA256,
  name: (val: string) => {
    const transformed = capitalizeAfterSpaceAndHyphen(val);
    return encryptData(transformed);
  },
  surname: (val: string) => {
    const transformed = capitalizeAfterSpaceAndHyphen(val);
    return encryptData(transformed);
  },
  role: encryptData,
  email: (val: string) => val.toLowerCase(),
  password: hashWithBcrypt,
};
