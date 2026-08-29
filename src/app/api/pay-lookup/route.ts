import { NextRequest, NextResponse } from "next/server";
import { getUserByPayToken, getPackageById, getEmployeeByRefId } from "@/lib/repo";

export const dynamic = "force-dynamic";


export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const user = await getUserByPayToken(token);
  if (!user) {
    return NextResponse.json({ error: "This payment link isn't valid." }, { status: 404 });
  }
  const pkg = await getPackageById(user.packageId);
  const employee = await getEmployeeByRefId(user.employeeRefId);

  return NextResponse.json({
    name: user.name,
    amount: user.amount,
    billingCycle: user.billingCycle,
    paymentStatus: user.paymentStatus,
    package: pkg,
    employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "",
  });
}
