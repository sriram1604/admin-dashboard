import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { pin } = await request.json();
  const ADMIN_PIN = process.env.ADMIN_PIN ?? "pakadmin@123";

  if (pin === ADMIN_PIN) {
    await createSession();  
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
