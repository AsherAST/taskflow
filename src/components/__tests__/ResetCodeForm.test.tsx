import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetCodeForm from "@/components/ResetCodeForm";

const { routerPush, fetchMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.stubGlobal("fetch", fetchMock);

describe("ResetCodeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("verifica el código, guarda el changeToken y navega", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, changeToken: "ct123" }),
    });

    render(<ResetCodeForm email="ana@example.com" />);

    await userEvent.type(screen.getByLabelText("Código"), "123456");
    await userEvent.click(
      screen.getByRole("button", { name: "Verificar código" }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/verify-code");
    expect(JSON.parse(init.body)).toMatchObject({
      email: "ana@example.com",
      code: "123456",
    });

    await waitFor(() =>
      expect(sessionStorage.getItem("changeToken")).toBe("ct123"),
    );
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/reset-password"));
  });

  it("muestra el error si el código es inválido", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "El código es inválido o ya expiró." }),
    });

    render(<ResetCodeForm email="ana@example.com" />);

    await userEvent.type(screen.getByLabelText("Código"), "000000");
    await userEvent.click(
      screen.getByRole("button", { name: "Verificar código" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El código es inválido o ya expiró.",
    );
    expect(routerPush).not.toHaveBeenCalled();
  });
});
