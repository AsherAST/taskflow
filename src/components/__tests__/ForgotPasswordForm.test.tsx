import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

const { routerPush, fetchMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.stubGlobal("fetch", fetchMock);

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envía el correo y navega a la pantalla de código", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<ForgotPasswordForm />);

    await userEvent.type(
      screen.getByLabelText("Correo electrónico"),
      "ana@example.com",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Enviar código de recuperación" }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/forgot-password");
    expect(JSON.parse(init.body)).toMatchObject({
      email: "ana@example.com",
    });

    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await waitFor(() =>
      expect(routerPush).toHaveBeenCalledWith(
        "/reset-password/code?email=ana%40example.com",
      ),
    );
  });

  it("muestra el error del servidor", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Correo inválido" }),
    });

    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText("Correo electrónico"), "malo");
    await userEvent.click(
      screen.getByRole("button", { name: "Enviar código de recuperación" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Correo inválido");
    expect(routerPush).not.toHaveBeenCalled();
  });
});
