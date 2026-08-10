import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  email: z.string().trim().email("Correo electrónico inválido").max(120),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Correo electrónico inválido").max(120),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Correo electrónico inválido").max(120),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Falta el token"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100),
});

export const boardSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(60),
});

export const columnSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(60),
  boardId: z.string().min(1, "Falta el tablero"),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(120),
  description: z.string().trim().max(500).optional(),
  columnId: z.string().min(1, "Falta la columna"),
});

export const moveTaskSchema = z.object({
  taskId: z.string().min(1),
  columnId: z.string().min(1),
  position: z.number().int().min(0),
});

export const updateTaskSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().trim().min(1, "El título es obligatorio").max(120),
  description: z.string().trim().max(500).optional(),
});
