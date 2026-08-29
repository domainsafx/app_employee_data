import { NextRequest, NextResponse } from "next/server";
import { getValidOtp, deleteOtp, getEmployeeByMobile, logActivity } from "@/lib/repo";
import { setSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";


export async function POST(req: NextRequest) {
  const { mobile, otp } = await req.json();
  const entry = await getValidOtp(String(mobile));
  if (!entry || entry.otp !== otp) {
    return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 401 });
  }
  const employee = await getEmployeeByMobile(String(mobile));
  if (!employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }
  setSessionCookie({
    type: "employee",
    id: employee.id,
    refId: employee.refId,
    name: `${employee.firstName} ${employee.lastName}`,
  });
  await deleteOtp(String(mobile));
  await logActivity({
    actor: `${employee.firstName} ${employee.lastName}`,
    action: "Logged in",
    details: `Employee (${employee.refId}) logged in via OTP`,
  });
  return NextResponse.json({ ok: true, refId: employee.refId, name: `${employee.firstName} ${employee.lastName}` });
}
