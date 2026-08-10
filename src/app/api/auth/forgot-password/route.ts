import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators";
import { db } from "@/lib/db";
import {
  createPasswordResetCode,
  canResendCode,
} from "@/lib/password-reset";
import { sendPasswordResetCode } from "@/lib/mailer";

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

  if (user && (await canResendCode(user.id))) {
    const code = await createPasswordResetCode(user.id);
    try {
      await sendPasswordResetCode(email, code);
    } catch (err) {
      console.error("FORGOT-PASSWORD-EMAIL-ERROR", err);
    }
  }

  return NextResponse.json({ ok: true });
}
