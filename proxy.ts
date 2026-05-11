import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Routes that don't require authentication
const publicPaths = ["/login", "/api/auth/login", "/api/auth/session"];

// Static asset patterns to skip
const staticPatterns = [
  /^\/_next\//,
  /^\/favicon\.ico/,
  /\.(css|js|svg|png|jpg|jpeg|gif|woff|woff2|ttf|eot)$/,
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets
  if (staticPatterns.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for auth token in cookie
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    // Redirect to login for page requests, return 401 for API
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    // Token invalid/expired
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("auth_token");
    return response;
  }

  // Token valid — pass user info via headers for API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", String(payload.userId));
  requestHeaders.set("x-user-email", payload.email);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
