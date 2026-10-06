import { createHash, randomBytes, randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from "@/auth/constants";

type AccessPayload = { sub: string; role: "ADMIN" | "USER"; jti: string };

function accessSecret() {
  const value = process.env.JWT_ACCESS_SECRET;
  if (!value || value.length < 32) throw new Error("JWT_ACCESS_SECRET deve ter ao menos 32 caracteres.");
  return new TextEncoder().encode(value);
}

export async function createAccessToken({ sub, role, jti }: AccessPayload) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(accessSecret());
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret(), { algorithms: ["HS256"] });
  if (typeof payload.sub !== "string" || (payload.role !== "ADMIN" && payload.role !== "USER")) {
    throw new Error("Token inválido.");
  }
  return { userId: payload.sub, role: payload.role };
}

export function createRefreshToken() {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionFamilyId() {
  return randomUUID();
}

export function refreshExpiry() {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
}
