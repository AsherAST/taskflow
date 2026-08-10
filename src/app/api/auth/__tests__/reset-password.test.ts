// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateMock, getValidMock, consumeMock } = vi.hoisted(() => ({
  updateMock: vi.fn(),
  getValidMock: vi.fn(),
  consumeMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: { update: updateMock },
  },
}));

vi.mock("@/lib/password-reset", () => ({
  getValidChangeToken: (...args: unknown[]) => getValidMock(...args),
  consumeResetToken: (...args: unknown[]) => consumeMock(...args),
}));

import { POST } from "@/app/api/auth/reset-password/route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("actualiza la contraseña y consume el changeToken (200)", async () => {
    getValidMock.mockResolvedValue({ id: "rt1", userId: "u1" });
    updateMock.mockResolvedValue({ id: "u1" });

    const res = await POST(
      jsonRequest({ changeToken: "tok123", password: "nueva12345" }),
    );
    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: expect.objectContaining({ passwordHash: expect.any(String) }),
      }),
    );
    expect(consumeMock).toHaveBeenCalledWith("rt1");
  });

  it("rechaza changeToken inválido o expirado (400)", async () => {
    getValidMock.mockResolvedValue(null);
    const res = await POST(
      jsonRequest({ changeToken: "malo", password: "nueva12345" }),
    );
    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rechaza contraseña corta (400)", async () => {
    const res = await POST(jsonRequest({ changeToken: "tok", password: "123" }));
    expect(res.status).toBe(400);
    expect(getValidMock).not.toHaveBeenCalled();
  });
});
