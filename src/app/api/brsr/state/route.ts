import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  if (!year) {
    return NextResponse.json({ message: "Year is required" }, { status: 400 });
  }

  const { data, error } = await db
    .from("brsr_reports")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("fiscal_year", year)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 is code for 'no rows found'
    return NextResponse.json({ message: "Database error", error }, { status: 500 });
  }

  return NextResponse.json(data || { empty: true });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { year, pyData, formData, isUploaded, isReportGenerated } = await request.json();

    if (!year) {
      return NextResponse.json({ message: "Year is required" }, { status: 400 });
    }

    // Upsert the report state
    const { data, error } = await db.from("brsr_reports").upsert(
      {
        user_id: session.user.id,
        fiscal_year: year,
        py_data: pyData,
        fy_data: formData,
        is_uploaded: isUploaded,
        is_report_generated: isReportGenerated,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,fiscal_year" } // Requires a unique constraint on (user_id, fiscal_year)
    ).select().single();

    if (error) {
      console.error("Save state error:", error);
      return NextResponse.json({ message: "Failed to save state", error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
