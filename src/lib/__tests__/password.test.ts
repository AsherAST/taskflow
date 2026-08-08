// @vitest-environment node
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password", () => {
  it("genera un hash y verifica la contraseña correcta", async () => {
    const hash = await hashPassword("mi-contraseña");
    expect(hash).not.toBe("mi-contraseña");
    expect(await verifyPassword("mi-contraseña", hash)).toBe(true);
  });

  it("rechaza una contraseña incorrecta", async () => {
    const hash = await hashPassword("correcta");
    expect(await verifyPassword("incorrecta", hash)).toBe(false);
  });
});
