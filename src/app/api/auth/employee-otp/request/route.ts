import { NextRequest, NextResponse } from "next/server";
import { getEmployeeByMobile, setOtp } from "@/lib/repo";

export const dynamic = "force-dynamic";


function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { mobile } = await req.json();
  if (!mobile || String(mobile).trim().length < 10) {
    return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });
  }
  const employee = await getEmployeeByMobile(String(mobile));
  if (!employee) {
    return NextResponse.json(
      { error: "We couldn't find an employee with this mobile number. Ask your admin to add you." },
      { status: 404 }
    );
  }
  if (employee.status === "inactive") {
    return NextResponse.json(
      { error: "Your account is inactive. Please contact your admin." },
      { status: 403 }
    );
  }

  const otp = generateOtp();
  await setOtp(String(mobile), otp, new Date(Date.now() + 5 * 60 * 1000));

  // In a real product this OTP would be sent via an SMS gateway.
  // For this demo build we return it directly so the flow can be tested end to end.
  return NextResponse.json({ ok: true, demoOtp: otp, employeeName: employee.firstName });
}
