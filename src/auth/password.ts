import { hash, verify } from "@node-rs/argon2";

const options = {
  algorithm: 2,
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
} as const;

export function hashPassword(password: string) {
  return hash(password, options);
}

export function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password, options);
}
