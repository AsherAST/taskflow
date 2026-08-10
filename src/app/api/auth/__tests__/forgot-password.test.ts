// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUniqueMock, createTokenMock, sendEmailMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  createTokenMock: vi.fn(),
  sendEmailMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: findUniqueMock },
  },
}));

vi.mock("@/lib/password-reset", () => ({
  createPasswordResetToken: (...args: unknown[]) => createTokenMock(...args),
  sendPasswordResetEmail: (...args: unknown[]) => sendEmailMock(...args),
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

  it("crea token y envía email si el usuario existe (200)", async () => {
    findUniqueMock.mockResolvedValue({ id: "u1", email: "ana@example.com" });
    createTokenMock.mockResolvedValue("tok123");
    sendEmailMock.mockResolvedValue(undefined);

    const res = await POST(jsonRequest({ email: "ana@example.com" }));
    expect(res.status).toBe(200);
    expect(createTokenMock).toHaveBeenCalledWith("u1");
    expect(sendEmailMock).toHaveBeenCalledWith(
      "ana@example.com",
      "http://localhost/reset-password/tok123",
    );
  });

  it("responde ok aunque el usuario no exista (200)", async () => {
    findUniqueMock.mockResolvedValue(null);
    const res = await POST(jsonRequest({ email: "nadie@example.com" }));
    expect(res.status).toBe(200);
    expect(createTokenMock).not.toHaveBeenCalled();
  });

  it("devuelve 500 si falla el envío del email", async () => {
    findUniqueMock.mockResolvedValue({ id: "u1", email: "ana@example.com" });
    createTokenMock.mockResolvedValue("tok123");
    sendEmailMock.mockRejectedValue(new Error("smtp"));

    const res = await POST(jsonRequest({ email: "ana@example.com" }));
    expect(res.status).toBe(500);
  });

  it("rechaza correo inválido (400)", async () => {
    const res = await POST(jsonRequest({ email: "malo" }));
    expect(res.status).toBe(400);
  });
});
