import { NextResponse } from "next/server";

import { HTTP_STATUS_CODES } from "@/lib/http/http-status-codes";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true }, { status: HTTP_STATUS_CODES.SUCCESS });
}
