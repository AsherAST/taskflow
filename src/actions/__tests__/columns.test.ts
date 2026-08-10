// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserIdMock, findUniqueMock, updateMock, boardFindUniqueMock, findManyMock, transactionMock } = vi.hoisted(() => ({
  getUserIdMock: vi.fn(),
  findUniqueMock: vi.fn(),
  updateMock: vi.fn(),
  boardFindUniqueMock: vi.fn(),
  findManyMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getSessionUserId: () => getUserIdMock(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    column: {
      findUnique: findUniqueMock,
      update: updateMock,
      findMany: findManyMock,
    },
    board: {
      findUnique: boardFindUniqueMock,
    },
    $transaction: transactionMock,
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { updateColumn, moveColumn } from "@/actions/columns";

describe("updateColumn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza datos inválidos", async () => {
    const result = await updateColumn({ columnId: "c1", title: "" });
    expect(result.ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rechaza usuario sin sesión", async () => {
    getUserIdMock.mockResolvedValue(null);
    const result = await updateColumn({ columnId: "c1", title: "Nuevo" });
    expect(result.ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rechaza columna que no pertenece al usuario", async () => {
    getUserIdMock.mockResolvedValue("u1");
    findUniqueMock.mockResolvedValue({
      id: "c1",
      boardId: "b1",
      board: { ownerId: "otro" },
    });
    const result = await updateColumn({ columnId: "c1", title: "Nuevo" });
    expect(result.ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("actualiza el título de la columna", async () => {
    getUserIdMock.mockResolvedValue("u1");
    findUniqueMock.mockResolvedValue({
      id: "c1",
      boardId: "b1",
      board: { ownerId: "u1" },
    });
    updateMock.mockResolvedValue({ id: "c1", title: "En curso" });

    const result = await updateColumn({ columnId: "c1", title: "En curso" });
    expect(result.ok).toBe(true);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { title: "En curso" },
    });
  });
});

describe("moveColumn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza datos inválidos", async () => {
    const result = await moveColumn({ columnId: "c1", boardId: "b1", position: -1 });
    expect(result.ok).toBe(false);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("rechaza usuario sin sesión", async () => {
    getUserIdMock.mockResolvedValue(null);
    const result = await moveColumn({ columnId: "c1", boardId: "b1", position: 0 });
    expect(result.ok).toBe(false);
  });

  it("rechaza tablero que no pertenece al usuario", async () => {
    getUserIdMock.mockResolvedValue("u1");
    boardFindUniqueMock.mockResolvedValue({ id: "b1", ownerId: "otro" });
    const result = await moveColumn({ columnId: "c1", boardId: "b1", position: 0 });
    expect(result.ok).toBe(false);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("rechaza columna de otro tablero", async () => {
    getUserIdMock.mockResolvedValue("u1");
    boardFindUniqueMock.mockResolvedValue({ id: "b1", ownerId: "u1" });
    findUniqueMock.mockResolvedValue({ id: "c1", boardId: "otro" });
    const result = await moveColumn({ columnId: "c1", boardId: "b1", position: 0 });
    expect(result.ok).toBe(false);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("reordena las columnas del tablero", async () => {
    getUserIdMock.mockResolvedValue("u1");
    boardFindUniqueMock.mockResolvedValue({ id: "b1", ownerId: "u1" });
    findUniqueMock.mockResolvedValue({ id: "c1", boardId: "b1" });
    findManyMock.mockResolvedValue([
      { id: "c1", position: 0 },
      { id: "c2", position: 1 },
      { id: "c3", position: 2 },
    ]);

    const result = await moveColumn({ columnId: "c3", boardId: "b1", position: 0 });

    expect(result.ok).toBe(true);
    expect(transactionMock).toHaveBeenCalledOnce();
    const callback = transactionMock.mock.calls[0][0];
    const tx = { column: { update: updateMock } };
    await callback(tx);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "c3" },
      data: { position: 0 },
    });
  });
});
