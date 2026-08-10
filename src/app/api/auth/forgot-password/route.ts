import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators";
import { db } from "@/lib/db";
import {
  createPasswordResetToken,
  sendPasswordResetEmail,
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

  if (user) {
    const token = await createPasswordResetToken(user.id);
    const origin =
      process.env.APP_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const resetUrl = buildResetUrl(origin, token);
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
      console.error("RESET-EMAIL-ERROR", error);
      return NextResponse.json(
        { error: "No se pudo enviar el correo. Intenta de nuevo." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
