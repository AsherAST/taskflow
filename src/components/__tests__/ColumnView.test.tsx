import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ColumnView from "@/components/ColumnView";
import type { BoardColumn } from "@/components/KanbanBoard";

function makeColumn(overrides: Partial<BoardColumn> = {}): BoardColumn {
  return {
    id: "c1",
    title: "Pendiente",
    tasks: [],
    ...overrides,
  };
}

function renderColumn(overrides: Partial<BoardColumn> = {}, dragColumnId: string | null = null) {
  const onUpdateColumn = vi.fn();
  const onDeleteColumn = vi.fn();
  const onColumnDrop = vi.fn();
  const onColumnDragOver = vi.fn();
  render(
    <ColumnView
      column={makeColumn(overrides)}
      index={0}
      dragTaskId={null}
      dragOverColumnId={null}
      dropIndicator={null}
      dragColumnId={dragColumnId}
      onDragStart={vi.fn()}
      onDragEnd={vi.fn()}
      onDragOverTask={vi.fn()}
      onDragOverColumn={vi.fn()}
      onDropTask={vi.fn()}
      onColumnDragStart={vi.fn()}
      onColumnDragEnd={vi.fn()}
      onColumnDragOver={onColumnDragOver}
      onColumnDrop={onColumnDrop}
      onAddTask={vi.fn()}
      onUpdateTask={vi.fn()}
      onDeleteTask={vi.fn()}
      onUpdateColumn={onUpdateColumn}
      onDeleteColumn={onDeleteColumn}
    />,
  );
  return { onUpdateColumn, onDeleteColumn, onColumnDrop, onColumnDragOver };
}

describe("ColumnView", () => {
  it("muestra el título de la columna", () => {
    renderColumn();
    expect(
      screen.getByRole("heading", { name: "Pendiente" }),
    ).toBeInTheDocument();
  });

  it("edita el título de la columna al guardar", async () => {
    const user = userEvent.setup();
    const { onUpdateColumn } = renderColumn();

    await user.click(screen.getByRole("button", { name: "Editar columna Pendiente" }));
    const input = screen.getByLabelText("Nombre de la columna");
    await user.clear(input);
    await user.type(input, "En curso");
    await user.click(screen.getByRole("button", { name: "Guardar columna En curso" }));

    expect(onUpdateColumn).toHaveBeenCalledWith("c1", "En curso");
  });

  it("no llama onUpdateColumn si el título no cambia", async () => {
    const user = userEvent.setup();
    const { onUpdateColumn } = renderColumn();

    await user.click(screen.getByRole("button", { name: "Editar columna Pendiente" }));
    await user.click(screen.getByRole("button", { name: "Guardar columna Pendiente" }));

    expect(onUpdateColumn).not.toHaveBeenCalled();
  });

  it("confirma antes de eliminar la columna", async () => {
    const user = userEvent.setup();
    const { onDeleteColumn } = renderColumn();

    const deleteBtn = screen.getByRole("button", { name: "Eliminar columna Pendiente" });
    await user.click(deleteBtn);
    expect(onDeleteColumn).not.toHaveBeenCalled();
    expect(deleteBtn).toHaveTextContent("¿Seguro?");
    await user.click(deleteBtn);
    expect(onDeleteColumn).toHaveBeenCalledWith("c1");
  });

  it("solicita el drop de la columna al soltar", () => {
    const { onColumnDrop, onColumnDragOver } = renderColumn({}, "c2");

    const column = screen.getByTestId("column");

    fireEvent.dragStart(screen.getByLabelText("Mover columna Pendiente"), {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    });
    fireEvent.dragOver(column);

    expect(onColumnDragOver).toHaveBeenCalledWith("c1");

    fireEvent.drop(column);

    expect(onColumnDrop).toHaveBeenCalledWith("c1", 0);
  });
});
