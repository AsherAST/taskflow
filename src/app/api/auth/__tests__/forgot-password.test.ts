// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUniqueMock, createTokenMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  createTokenMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: findUniqueMock },
  },
}));

vi.mock("@/lib/password-reset", () => ({
  createPasswordResetToken: (...args: unknown[]) => createTokenMock(...args),
  getAppOrigin: () => "http://localhost",
  buildResetUrl: (_base: string, token: string) => `http://localhost/reset-password/${token}`,
}));

import { POST } from "@/app/api/auth/forgot-password/route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea token y devuelve el enlace si el usuario existe (200)", async () => {
    findUniqueMock.mockResolvedValue({ id: "u1", email: "ana@example.com" });
    createTokenMock.mockResolvedValue("tok123");

    const res = await POST(jsonRequest({ email: "ana@example.com" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(createTokenMock).toHaveBeenCalledWith("u1");
    expect(body.resetUrl).toBe("http://localhost/reset-password/tok123");
  });

  it("responde ok sin enlace si el usuario no existe (200)", async () => {
    findUniqueMock.mockResolvedValue(null);
    const res = await POST(jsonRequest({ email: "nadie@example.com" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(createTokenMock).not.toHaveBeenCalled();
    expect(body.resetUrl).toBeUndefined();
  });

  it("rechaza correo inválido (400)", async () => {
    const res = await POST(jsonRequest({ email: "malo" }));
    expect(res.status).toBe(400);
  });
});
