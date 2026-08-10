import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators";
import { db } from "@/lib/db";
import {
  createPasswordResetToken,
  getAppOrigin,
  buildResetUrl,
} from "@/lib/password-reset";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const { email } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  let resetUrl: string | undefined;
  if (user) {
    const token = await createPasswordResetToken(user.id);
    resetUrl = buildResetUrl(getAppOrigin(), token);
  }

  return NextResponse.json({ ok: true, resetUrl });
}
