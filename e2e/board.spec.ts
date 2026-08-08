import { test, expect } from "@playwright/test";

const unique = Date.now();

test("mueve una tarea entre columnas con drag & drop", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nombre").fill("Test DnD");
  await page.getByLabel("Correo electrónico").fill(`dnd-${unique}@taskflow.app`);
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/boards$/);

  await page.getByLabel("Título del tablero").fill("Tablero DnD");
  await page.getByRole("button", { name: "Crear" }).click();
  await expect(page).toHaveURL(/\/boards\/.+/);

  await page.getByPlaceholder("+ Añadir columna").fill("Col A");
  await page.getByPlaceholder("+ Añadir columna").press("Enter");
  await page.getByPlaceholder("+ Añadir columna").fill("Col B");
  await page.getByPlaceholder("+ Añadir columna").press("Enter");

  const colA = page
    .locator("[data-testid=column]")
    .filter({ has: page.getByRole("heading", { name: "Col A" }) });
  const colB = page
    .locator("[data-testid=column]")
    .filter({ has: page.getByRole("heading", { name: "Col B" }) });

  await colA.getByRole("button", { name: "+ Añadir tarea" }).click();
  await colA.getByPlaceholder("Título de la tarea").fill("Tarea movible");
  await colA.getByRole("button", { name: "Añadir" }).click();
  await expect(colA.getByText("Tarea movible")).toBeVisible();

  const task = colA.getByTestId("task");
  await task.dragTo(colB);

  await expect(colB.getByText("Tarea movible")).toBeVisible();
  await expect(colA.getByText("Tarea movible")).not.toBeVisible();
});
