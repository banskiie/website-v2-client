// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Role } from "./types/user.interface"
import jwt, { JwtPayload } from "jsonwebtoken"

const PUBLIC_ROUTES = ["/", "/login"]
const PROTECTED_ROUTES = [
  {
    path: "/dashboard",
    roles: [
      Role.ADMIN,
      Role.ACCOUNTING,
      Role.LEVELLER,
      Role.ORGANIZER,
      Role.SUPPORT,
    ],
    type: "AUTHENTICATED",
    needsAuth: true,
  },
  {
    path: "/entries",
    roles: [Role.ADMIN, Role.LEVELLER, Role.ORGANIZER, Role.SUPPORT],
    needsAuth: true,
  },
  {
    path: "/events",
    roles: [Role.ADMIN, Role.ORGANIZER, Role.SUPPORT],
    needsAuth: true,
  },
  {
    path: "/jerseys",
    roles: [Role.ADMIN, Role.ORGANIZER, Role.ACCOUNTING, Role.SUPPORT],
    needsAuth: true,
  },
  {
    path: "/logs",
    roles: [Role.ADMIN, Role.SUPPORT],
    needsAuth: true,
  },
  {
    path: "/players",
    roles: [Role.ADMIN, Role.ORGANIZER, Role.LEVELLER, Role.SUPPORT],
    needsAuth: true,
  },
  {
    path: "/settings",
    roles: [Role.ADMIN, Role.SUPPORT],
    needsAuth: true,
  },
  {
    path: "/tournaments",
    roles: [Role.ADMIN, Role.ORGANIZER, Role.SUPPORT],
    needsAuth: true,
  },
  {
    path: "/users",
    roles: [Role.ADMIN, Role.SUPPORT],
    needsAuth: true,
  },
  {
    path: "/videos",
    roles: [Role.ADMIN, Role.ORGANIZER, Role.LEVELLER, Role.SUPPORT],
    needsAuth: true,
  },
  {
    path: "/tickets",
    roles: [Role.ADMIN, Role.ORGANIZER, Role.SUPPORT],
    needsAuth: true,
  },
]

export async function proxy(req: NextRequest) {
  const REFRESH_TOKEN = req.cookies.get("refreshToken")?.value || null
  const PATHNAME = req.nextUrl.pathname
  const ROLE = (jwt.decode(REFRESH_TOKEN || "") as JwtPayload)?.role || null

  const PROTECTED_ROUTES_PATHS = PROTECTED_ROUTES.filter(
    (route) => route.needsAuth
  ).map((r) => r.path)

  if (PUBLIC_ROUTES.includes(PATHNAME) && REFRESH_TOKEN)
    return NextResponse.redirect(new URL("/dashboard", req.url))

  if (PROTECTED_ROUTES_PATHS.includes(PATHNAME)) {
    // If no refresh token, redirect to login
    if (!REFRESH_TOKEN) return NextResponse.redirect(new URL("/login", req.url))
    const route = PROTECTED_ROUTES.find((r) => r.path === PATHNAME)
    // If invalid role permissions, redirect to dashboard
    if (route && ROLE && !route.roles.includes(ROLE as Role)) {
      console.warn(
        "Invalid permission to access route, redirecting to dashboard..."
      )
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

// Run on all routes (or you can restrict with matcher)
export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/entries/:path*",
    "/events/:path*",
    "/jerseys/:path*",
    "/logs/:path*",
    "/payments/:path*",
    "/players/:path*",
    "/settings/:path*",
    "/tournaments/:path*",
    "/users/:path*",
    "/videos/:path*",
    "/tickets/:path*",
  ],
}
