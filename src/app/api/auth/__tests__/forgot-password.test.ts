// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUniqueMock, createCodeMock, canResendMock, sendMailMock } =
  vi.hoisted(() => ({
    findUniqueMock: vi.fn(),
    createCodeMock: vi.fn(),
    canResendMock: vi.fn(),
    sendMailMock: vi.fn(),
  }));

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: findUniqueMock },
  },
}));

vi.mock("@/lib/password-reset", () => ({
  createPasswordResetCode: (...args: unknown[]) => createCodeMock(...args),
  canResendCode: (...args: unknown[]) => canResendMock(...args),
}));

vi.mock("@/lib/mailer", () => ({
  sendPasswordResetCode: (...args: unknown[]) => sendMailMock(...args),
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

  it("crea código y envía el email si el usuario existe (200)", async () => {
    findUniqueMock.mockResolvedValue({ id: "u1", email: "ana@example.com" });
    canResendMock.mockResolvedValue(true);
    createCodeMock.mockResolvedValue("123456");

    const res = await POST(jsonRequest({ email: "ana@example.com" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(createCodeMock).toHaveBeenCalledWith("u1");
    expect(sendMailMock).toHaveBeenCalledWith("ana@example.com", "123456");
    expect(body.resetUrl).toBeUndefined();
  });

  it("responde ok sin enviar si el usuario no existe (200)", async () => {
    findUniqueMock.mockResolvedValue(null);
    const res = await POST(jsonRequest({ email: "nadie@example.com" }));
    expect(res.status).toBe(200);
    expect(createCodeMock).not.toHaveBeenCalled();
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("no reenvía durante el cooldown", async () => {
    findUniqueMock.mockResolvedValue({ id: "u1", email: "ana@example.com" });
    canResendMock.mockResolvedValue(false);

    const res = await POST(jsonRequest({ email: "ana@example.com" }));
    expect(res.status).toBe(200);
    expect(createCodeMock).not.toHaveBeenCalled();
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("rechaza correo inválido (400)", async () => {
    const res = await POST(jsonRequest({ email: "malo" }));
    expect(res.status).toBe(400);
  });
});
