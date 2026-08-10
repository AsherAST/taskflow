import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordForm from "@/components/ResetPasswordForm";

const { routerPush, routerRefresh, fetchMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerRefresh: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh }),
}));

vi.stubGlobal("fetch", fetchMock);

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("envía changeToken y nueva contraseña, limpia el token y navega", async () => {
    sessionStorage.setItem("changeToken", "ct123");
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<ResetPasswordForm />);

    await userEvent.type(screen.getByLabelText("Nueva contraseña"), "nueva12345");
    await userEvent.click(
      screen.getByRole("button", { name: "Cambiar contraseña" }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/reset-password");
    expect(JSON.parse(init.body)).toMatchObject({
      changeToken: "ct123",
      password: "nueva12345",
    });

    await waitFor(() =>
      expect(sessionStorage.getItem("changeToken")).toBeNull(),
    );
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/login"));
  });

  it("avisa si no hay changeToken verificado", async () => {
    render(<ResetPasswordForm />);

    expect(
      await screen.findByText(
        "No hay un código verificado. Solicita un nuevo código de recuperación.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cambiar contraseña" }),
    ).not.toBeInTheDocument();
  });

  it("muestra el error del servidor", async () => {
    sessionStorage.setItem("changeToken", "ct123");
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "El enlace es inválido o ya expiró." }),
    });

    render(<ResetPasswordForm />);

    await userEvent.type(screen.getByLabelText("Nueva contraseña"), "nueva12345");
    await userEvent.click(
      screen.getByRole("button", { name: "Cambiar contraseña" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El enlace es inválido o ya expiró.",
    );
    expect(routerPush).not.toHaveBeenCalled();
  });
});
