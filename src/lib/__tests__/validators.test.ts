// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  registerSchema,
  loginSchema,
  boardSchema,
  updateBoardSchema,
  columnSchema,
  updateColumnSchema,
  moveColumnSchema,
  taskSchema,
  moveTaskSchema,
  updateTaskSchema,
} from "@/lib/validators";

describe("registerSchema", () => {
  it("acepta datos válidos", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre corto", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "ana@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza email inválido", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "no-es-un-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña corta", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("acepta credenciales válidas", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "x" }).success,
    ).toBe(true);
  });

  it("rechaza email inválido", () => {
    expect(
      loginSchema.safeParse({ email: "malo", password: "x" }).success,
    ).toBe(false);
  });
});

describe("boardSchema", () => {
  it("rechaza título vacío", () => {
    expect(boardSchema.safeParse({ title: "   " }).success).toBe(false);
  });

  it("acepta título válido", () => {
    expect(boardSchema.safeParse({ title: "Mi tablero" }).success).toBe(true);
  });
});

describe("updateBoardSchema", () => {
  it("requiere boardId", () => {
    expect(updateBoardSchema.safeParse({ title: "Nuevo" }).success).toBe(false);
  });

  it("rechaza título vacío", () => {
    expect(
      updateBoardSchema.safeParse({ boardId: "b1", title: " " }).success,
    ).toBe(false);
  });

  it("acepta datos válidos", () => {
    expect(
      updateBoardSchema.safeParse({ boardId: "b1", title: "Nuevo" }).success,
    ).toBe(true);
  });
});

describe("columnSchema", () => {
  it("requiere boardId", () => {
    expect(columnSchema.safeParse({ title: "Pendiente" }).success).toBe(false);
  });

  it("acepta datos válidos", () => {
    expect(
      columnSchema.safeParse({ title: "Pendiente", boardId: "b1" }).success,
    ).toBe(true);
  });
});

describe("updateColumnSchema", () => {
  it("requiere columnId", () => {
    expect(updateColumnSchema.safeParse({ title: "Hecho" }).success).toBe(false);
  });

  it("rechaza título vacío", () => {
    expect(
      updateColumnSchema.safeParse({ columnId: "c1", title: "" }).success,
    ).toBe(false);
  });

  it("acepta datos válidos", () => {
    expect(
      updateColumnSchema.safeParse({ columnId: "c1", title: "En curso" })
        .success,
    ).toBe(true);
  });
});

describe("moveColumnSchema", () => {
  it("requiere boardId y columnId", () => {
    expect(moveColumnSchema.safeParse({ position: 1 }).success).toBe(false);
  });

  it("rechaza posición negativa", () => {
    expect(
      moveColumnSchema.safeParse({
        columnId: "c1",
        boardId: "b1",
        position: -1,
      }).success,
    ).toBe(false);
  });

  it("acepta datos válidos", () => {
    expect(
      moveColumnSchema.safeParse({
        columnId: "c1",
        boardId: "b1",
        position: 2,
      }).success,
    ).toBe(true);
  });
});

describe("taskSchema", () => {
  it("requiere columnId", () => {
    expect(taskSchema.safeParse({ title: "Tarea" }).success).toBe(false);
  });

  it("acepta descripción opcional", () => {
    const result = taskSchema.safeParse({
      title: "Tarea",
      columnId: "c1",
      description: "Detalle",
    });
    expect(result.success).toBe(true);
    expect(result.success && result.data.description).toBe("Detalle");
  });
});

describe("moveTaskSchema", () => {
  it("rechaza posición negativa", () => {
    expect(
      moveTaskSchema.safeParse({
        taskId: "t1",
        columnId: "c1",
        position: -1,
      }).success,
    ).toBe(false);
  });

  it("acepta valores válidos", () => {
    expect(
      moveTaskSchema.safeParse({
        taskId: "t1",
        columnId: "c1",
        position: 3,
      }).success,
    ).toBe(true);
  });
});

describe("updateTaskSchema", () => {
  it("requiere título y taskId", () => {
    expect(updateTaskSchema.safeParse({ title: "X" }).success).toBe(false);
    expect(
      updateTaskSchema.safeParse({ taskId: "t1", title: "X" }).success,
    ).toBe(true);
  });
});
