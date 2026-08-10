import { NextResponse } from "next/server";
import { verifyCodeSchema } from "@/lib/validators";
import { db } from "@/lib/db";
import { verifyResetCode } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = verifyCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const { email, code } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json(
      { error: "El código es inválido o ya expiró." },
      { status: 400 },
    );
  }

  const result = await verifyResetCode(user.id, code);
  if (!result.ok) {
    return NextResponse.json(
      { error: "El código es inválido o ya expiró." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, changeToken: result.changeToken });
}
