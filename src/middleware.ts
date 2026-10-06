import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob: https:; connect-src 'self' https://viacep.com.br https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';");
  if (process.env.NODE_ENV === "production") response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  if (request.nextUrl.pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const configuredOrigin = process.env.APP_URL?.replace(/\/$/, "");
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const forwardedOrigin = forwardedHost && forwardedProto ? `${forwardedProto}://${forwardedHost}` : undefined;
    const allowedOrigins = new Set([request.nextUrl.origin, configuredOrigin, forwardedOrigin].filter((value): value is string => Boolean(value)));
    if (origin && !allowedOrigins.has(origin)) return NextResponse.json({ success: false, error: { code: "CSRF_ORIGIN_REJECTED", message: "Origem inválida." } }, { status: 403 });
  }
  return response;
}

export const config = { matcher: ["/:path*"] };
