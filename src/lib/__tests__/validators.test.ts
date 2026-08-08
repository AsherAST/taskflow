// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  registerSchema,
  loginSchema,
  boardSchema,
  columnSchema,
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
