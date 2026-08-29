import { NextRequest, NextResponse } from "next/server";
import { getUserByPayToken, updateUser, logActivity } from "@/lib/repo";

export const dynamic = "force-dynamic";


export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const user = await getUserByPayToken(token);
  if (!user) {
    return NextResponse.json({ error: "This payment link isn't valid." }, { status: 404 });
  }
  if (user.paymentStatus === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  await updateUser(user.id, { paymentStatus: "paid" });
  await logActivity({
    actor: "System",
    action: "Payment completed",
    details: `${user.name} paid ₹${user.amount} (${user.billingCycle})`,
  });

  return NextResponse.json({ ok: true });
}
