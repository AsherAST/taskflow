import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validators";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  getValidChangeToken,
  consumeResetToken,
} from "@/lib/password-reset";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const { changeToken, password } = parsed.data;
  const record = await getValidChangeToken(changeToken);
  if (!record) {
    return NextResponse.json(
      { error: "El enlace es inválido o ya expiró." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);
  await db.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });
  await consumeResetToken(record.id);

  return NextResponse.json({ ok: true });
}
