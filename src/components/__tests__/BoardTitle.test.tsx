import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BoardTitle from "@/components/BoardTitle";

const { routerRefresh, updateBoardMock } = vi.hoisted(() => ({
  routerRefresh: vi.fn(),
  updateBoardMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
}));

vi.mock("@/actions/boards", () => ({
  updateBoard: (args: { boardId: string; title: string }) =>
    updateBoardMock(args),
}));

describe("BoardTitle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el título del tablero", () => {
    render(<BoardTitle boardId="b1" initialTitle="Mi tablero" />);
    expect(
      screen.getByRole("heading", { name: "Mi tablero" }),
    ).toBeInTheDocument();
  });

  it("edita el título al guardar", async () => {
    const user = userEvent.setup();
    updateBoardMock.mockResolvedValue({ ok: true });
    render(<BoardTitle boardId="b1" initialTitle="Mi tablero" />);

    await user.click(screen.getByRole("button", { name: "Editar tablero Mi tablero" }));
    const input = screen.getByLabelText("Título del tablero");
    await user.clear(input);
    await user.type(input, "Tablero nuevo");
    await user.click(screen.getByRole("button", { name: "Guardar tablero Tablero nuevo" }));

    expect(updateBoardMock).toHaveBeenCalledWith({
      boardId: "b1",
      title: "Tablero nuevo",
    });
  });

  it("no llama updateBoard si el título no cambia", async () => {
    const user = userEvent.setup();
    render(<BoardTitle boardId="b1" initialTitle="Mi tablero" />);

    await user.click(screen.getByRole("button", { name: "Editar tablero Mi tablero" }));
    await user.click(screen.getByRole("button", { name: "Guardar tablero Mi tablero" }));

    expect(updateBoardMock).not.toHaveBeenCalled();
  });
});
