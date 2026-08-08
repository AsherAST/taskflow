// @vitest-environment node
import { describe, expect, it } from "vitest";
import { signSession, verifySessionToken } from "@/lib/auth";

describe("auth session", () => {
  it("firma y verifica un token válido", async () => {
    const token = await signSession({ userId: "u1" });
    const payload = await verifySessionToken(token);
    expect(payload).toEqual({ userId: "u1" });
  });

  it("devuelve null para un token inválido", async () => {
    const payload = await verifySessionToken("no-es-un-token");
    expect(payload).toBeNull();
  });

  it("devuelve null para un token alterado", async () => {
    const token = await signSession({ userId: "u1" });
    const tampered = token.slice(0, -4) + "XXXX";
    const payload = await verifySessionToken(tampered);
    expect(payload).toBeNull();
  });
});
