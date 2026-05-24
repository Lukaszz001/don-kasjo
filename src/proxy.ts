import { NextResponse, type NextRequest } from "next/server"

function getAllowedOrigins(request: NextRequest) {
  const origins = new Set<string>([request.nextUrl.origin])
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const vercelUrl = process.env.VERCEL_URL
  const extraOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS

  if (appUrl) origins.add(appUrl.replace(/\/$/, ""))
  if (vercelUrl) origins.add(`https://${vercelUrl}`)

  for (const origin of extraOrigins?.split(",") || []) {
    const trimmed = origin.trim().replace(/\/$/, "")
    if (trimmed) origins.add(trimmed)
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000")
    origins.add("http://127.0.0.1:3000")
  }

  return origins
}

function applyApiHeaders(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin")
  const requestHeaders = request.headers.get("access-control-request-headers")

  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")
  response.headers.set("Vary", "Origin, Access-Control-Request-Headers")
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
  response.headers.set(
    "Access-Control-Allow-Headers",
    requestHeaders || "Content-Type, Authorization"
  )
  response.headers.set("Access-Control-Max-Age", "86400")

  if (origin && getAllowedOrigins(request).has(origin.replace(/\/$/, ""))) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }

  return response
}

export function proxy(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return applyApiHeaders(request, new NextResponse(null, { status: 204 }))
  }

  return applyApiHeaders(request, NextResponse.next())
}

export const config = {
  matcher: "/api/:path*",
}
