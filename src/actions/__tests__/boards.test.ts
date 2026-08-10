// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserIdMock, findUniqueMock, updateMock } = vi.hoisted(() => ({
  getUserIdMock: vi.fn(),
  findUniqueMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getSessionUserId: () => getUserIdMock(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    board: {
      findUnique: findUniqueMock,
      update: updateMock,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { updateBoard } from "@/actions/boards";

describe("updateBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza datos inválidos", async () => {
    const result = await updateBoard({ boardId: "b1", title: " " });
    expect(result.ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rechaza usuario sin sesión", async () => {
    getUserIdMock.mockResolvedValue(null);
    const result = await updateBoard({ boardId: "b1", title: "Nuevo" });
    expect(result.ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rechaza tablero que no pertenece al usuario", async () => {
    getUserIdMock.mockResolvedValue("u1");
    findUniqueMock.mockResolvedValue({ id: "b1", ownerId: "otro" });
    const result = await updateBoard({ boardId: "b1", title: "Nuevo" });
    expect(result.ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("actualiza el título del tablero", async () => {
    getUserIdMock.mockResolvedValue("u1");
    findUniqueMock.mockResolvedValue({ id: "b1", ownerId: "u1" });
    updateMock.mockResolvedValue({ id: "b1", title: "Nuevo" });

    const result = await updateBoard({ boardId: "b1", title: "Nuevo" });
    expect(result.ok).toBe(true);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "b1" },
      data: { title: "Nuevo" },
    });
  });
});
