// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

const { setCookie, findUniqueMock } = vi.hoisted(() => ({
  setCookie: vi.fn(),
  findUniqueMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: setCookie,
    get: vi.fn(),
    delete: vi.fn(),
  }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: findUniqueMock },
  },
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    signSession: async () => "fake-session-token",
  };
});

import { POST } from "@/app/api/auth/login/route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inicia sesión y establece cookie (200)", async () => {
    const passwordHash = await bcrypt.hash("password123", 4);
    findUniqueMock.mockResolvedValue({
      id: "u1",
      email: "ana@example.com",
      passwordHash,
    });

    const res = await POST(
      jsonRequest({ email: "ana@example.com", password: "password123" }),
    );
    expect(res.status).toBe(200);
    expect(setCookie).toHaveBeenCalledWith(
      "taskflow_session",
      expect.any(String),
      expect.objectContaining({ httpOnly: true }),
    );

    const body = await res.json();
    expect(body.user.email).toBe("ana@example.com");
  });

  it("rechaza contraseña incorrecta (401)", async () => {
    const passwordHash = await bcrypt.hash("password123", 4);
    findUniqueMock.mockResolvedValue({
      id: "u1",
      email: "ana@example.com",
      passwordHash,
    });

    const res = await POST(
      jsonRequest({ email: "ana@example.com", password: "incorrecta" }),
    );
    expect(res.status).toBe(401);
    expect(setCookie).not.toHaveBeenCalled();
  });

  it("rechaza usuario inexistente (401)", async () => {
    findUniqueMock.mockResolvedValue(null);
    const res = await POST(
      jsonRequest({ email: "nadie@example.com", password: "password123" }),
    );
    expect(res.status).toBe(401);
  });

  it("rechaza datos inválidos (400)", async () => {
    const res = await POST(jsonRequest({ email: "malo", password: "" }));
    expect(res.status).toBe(400);
  });
});
