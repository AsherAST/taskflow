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

test("edita el título de una columna", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nombre").fill("Test EditCol");
  await page.getByLabel("Correo electrónico").fill(`editcol-${unique}@taskflow.app`);
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/boards$/);

  await page.getByLabel("Título del tablero").fill("Tablero EditCol");
  await page.getByRole("button", { name: "Crear" }).click();
  await expect(page).toHaveURL(/\/boards\/.+/);

  await page.getByPlaceholder("+ Añadir columna").fill("Col A");
  await page.getByPlaceholder("+ Añadir columna").press("Enter");

  await page.getByRole("button", { name: "Editar columna Col A" }).click();
  const input = page.getByLabel("Nombre de la columna");
  await input.fill("Col Renombrada");
  await page.getByRole("button", { name: "Guardar columna Col Renombrada" }).click();

  await expect(
    page.getByRole("heading", { name: "Col Renombrada" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Col A" })).not.toBeVisible();
});

test("edita el título del tablero", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nombre").fill("Test EditBoard");
  await page.getByLabel("Correo electrónico").fill(`editboard-${unique}@taskflow.app`);
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/boards$/);

  await page.getByLabel("Título del tablero").fill("Tablero Original");
  await page.getByRole("button", { name: "Crear" }).click();
  await expect(page).toHaveURL(/\/boards\/.+/);

  await page.getByRole("button", { name: "Editar tablero Tablero Original" }).click();
  const input = page.getByLabel("Título del tablero");
  await input.fill("Tablero Renombrado");
  await page.getByRole("button", { name: "Guardar tablero Tablero Renombrado" }).click();

  await expect(
    page.getByRole("heading", { name: "Tablero Renombrado" }),
  ).toBeVisible();
});

test("renombra una tarea", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nombre").fill("Test EditTask");
  await page.getByLabel("Correo electrónico").fill(`edittask-${unique}@taskflow.app`);
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/boards$/);

  await page.getByLabel("Título del tablero").fill("Tablero EditTask");
  await page.getByRole("button", { name: "Crear" }).click();
  await expect(page).toHaveURL(/\/boards\/.+/);

  await page.getByPlaceholder("+ Añadir columna").fill("Col A");
  await page.getByPlaceholder("+ Añadir columna").press("Enter");

  const colA = page
    .locator("[data-testid=column]")
    .filter({ has: page.getByRole("heading", { name: "Col A" }) });

  await colA.getByRole("button", { name: "+ Añadir tarea" }).click();
  await colA.getByPlaceholder("Título de la tarea").fill("Tarea antigua");
  await colA.getByRole("button", { name: "Añadir" }).click();
  await expect(colA.getByText("Tarea antigua")).toBeVisible();

  await colA.getByRole("button", { name: "Editar", exact: true }).click();
  const titleInput = colA.getByLabel("Título de la tarea");
  await titleInput.fill("Tarea renombrada");
  await colA.getByPlaceholder("Descripción (opcional)").fill("Nueva descripción");
  await colA.getByRole("button", { name: "Guardar" }).click();

  await expect(colA.getByText("Tarea renombrada")).toBeVisible();
  await expect(colA.getByText("Nueva descripción")).toBeVisible();
});

test("reordena columnas con drag & drop", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nombre").fill("Test OrderCol");
  await page.getByLabel("Correo electrónico").fill(`ordercol-${unique}@taskflow.app`);
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/boards$/);

  await page.getByLabel("Título del tablero").fill("Tablero OrderCol");
  await page.getByRole("button", { name: "Crear" }).click();
  await expect(page).toHaveURL(/\/boards\/.+/);

  await page.getByPlaceholder("+ Añadir columna").fill("Col A");
  await page.getByPlaceholder("+ Añadir columna").press("Enter");
  await page.getByPlaceholder("+ Añadir columna").fill("Col B");
  await page.getByPlaceholder("+ Añadir columna").press("Enter");

  const columns = page.locator("[data-testid=column]");
  await expect(columns).toHaveCount(2);

  await page.getByLabel("Mover columna Col A").dragTo(page.getByLabel("Mover columna Col B"));

  await expect(
    columns.first().getByRole("heading", { name: "Col B" }),
  ).toBeVisible();
  await expect(
    columns.nth(1).getByRole("heading", { name: "Col A" }),
  ).toBeVisible();
});
