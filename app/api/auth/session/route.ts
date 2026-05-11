import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/auth/session — Set token in httpOnly cookie
export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    (await cookies()).set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to set session" }, { status: 500 });
  }
}

// DELETE /api/auth/session — Clear auth cookie (logout)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  (await cookies()).delete("auth_token");
  return response;
}
