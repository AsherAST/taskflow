import { test, expect } from "@playwright/test";

const unique = Date.now();

test("registro, crea tablero con columnas y tareas, cierra sesión", async ({
  page,
}) => {
  await page.goto("/register");

  await page.getByLabel("Nombre").fill("Test E2E");
  await page
    .getByLabel("Correo electrónico")
    .fill(`e2e-${unique}@taskflow.app`);
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page).toHaveURL(/\/boards$/);

  await page.getByRole("button", { name: "+ Nuevo tablero" }).click();
  await page.getByLabel("Título del tablero").fill("Mi tablero E2E");
  await page.getByRole("button", { name: "Crear" }).click();
  await expect(page).toHaveURL(/\/boards\/.+/);
  await expect(
    page.getByRole("heading", { name: "Mi tablero E2E" }),
  ).toBeVisible();

  await page.getByPlaceholder("+ Añadir columna").fill("Pendiente");
  await page.getByPlaceholder("+ Añadir columna").press("Enter");
  await page.getByPlaceholder("+ Añadir columna").fill("Hecho");
  await page.getByPlaceholder("+ Añadir columna").press("Enter");

  await expect(
    page.getByRole("heading", { name: "Pendiente" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hecho" })).toBeVisible();

  const pendiente = page
    .locator("[data-testid=column]")
    .filter({ has: page.getByRole("heading", { name: "Pendiente" }) });
  await pendiente.getByRole("button", { name: "+ Añadir tarea" }).click();
  await pendiente.getByPlaceholder("Título de la tarea").fill("Tarea uno");
  await pendiente.getByRole("button", { name: "Añadir" }).click();
  await expect(pendiente.getByText("Tarea uno")).toBeVisible();

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
