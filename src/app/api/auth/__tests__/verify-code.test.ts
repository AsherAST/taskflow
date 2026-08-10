// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUniqueMock, verifyMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  verifyMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: findUniqueMock },
  },
}));

vi.mock("@/lib/password-reset", () => ({
  verifyResetCode: (...args: unknown[]) => verifyMock(...args),
}));

import { POST } from "@/app/api/auth/verify-code/route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/verify-code", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve changeToken si el código es válido (200)", async () => {
    findUniqueMock.mockResolvedValue({ id: "u1", email: "ana@example.com" });
    verifyMock.mockResolvedValue({ ok: true, changeToken: "ct123" });

    const res = await POST(
      jsonRequest({ email: "ana@example.com", code: "123456" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(verifyMock).toHaveBeenCalledWith("u1", "123456");
    expect(body.changeToken).toBe("ct123");
  });

  it("rechaza código inválido (400)", async () => {
    findUniqueMock.mockResolvedValue({ id: "u1", email: "ana@example.com" });
    verifyMock.mockResolvedValue({ ok: false, reason: "invalid" });

    const res = await POST(
      jsonRequest({ email: "ana@example.com", code: "000000" }),
    );
    expect(res.status).toBe(400);
  });

  it("rechaza si el usuario no existe (400)", async () => {
    findUniqueMock.mockResolvedValue(null);
    const res = await POST(
      jsonRequest({ email: "nadie@example.com", code: "123456" }),
    );
    expect(res.status).toBe(400);
  });

  it("rechaza código mal formado (400)", async () => {
    const res = await POST(
      jsonRequest({ email: "ana@example.com", code: "abc" }),
    );
    expect(res.status).toBe(400);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });
});
