// frontend/src/pages/Signup.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Signup from "./Signup";
import "@testing-library/jest-dom";
import { API_URL } from "api";

jest.mock("helpers/AnimationRevealPage.js", () => ({ children }) => <>{children}</>);

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

test("ob uspešni registraciji pošlje podatke na API in preusmeri na /login", async () => {
  console.log("🧪 SIGNUP: uspešna registracija — klic na backend + redirect na /login");

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({}),
  });

  render(<Signup />);

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "newuser@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Geslo"), {
    target: { value: "Geslo123" },
  });
  fireEvent.change(screen.getByPlaceholderText("Ime"), {
    target: { value: "Ana" },
  });
  fireEvent.change(screen.getByPlaceholderText("Priimek"), {
    target: { value: "Novak" },
  });

  fireEvent.click(screen.getByRole("button", { name: /Registracija/i }));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/uporabniki/register`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});

test("pri napaki iz backenda (npr. 'Uporabnik že obstaja') prikaže sporočilo o napaki", async () => {
  console.log("🧪 SIGNUP: backend vrne napako (Uporabnik že obstaja) — UI mora prikazati napako");

  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Uporabnik že obstaja." }),
  });

  render(<Signup />);

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "existing@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Geslo"), {
    target: { value: "Geslo123" },
  });
  fireEvent.change(screen.getByPlaceholderText("Ime"), {
    target: { value: "Ana" },
  });
  fireEvent.change(screen.getByPlaceholderText("Priimek"), {
    target: { value: "Novak" },
  });

  fireEvent.click(screen.getByRole("button", { name: /Registracija/i }));

  const errorMessage = await screen.findByText(/Uporabnik že obstaja./i);
  expect(errorMessage).toBeInTheDocument();
});

test("pri napaki omrežja prikaže sporočilo 'Napaka pri povezovanju s strežnikom.'", async () => {
  console.log("🧪 SIGNUP: napaka omrežja — UI mora prikazati 'Napaka pri povezovanju s strežnikom.'");

  global.fetch.mockRejectedValueOnce(new Error("Network error"));

  render(<Signup />);

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "user@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Geslo"), {
    target: { value: "Geslo123" },
  });
  fireEvent.change(screen.getByPlaceholderText("Ime"), {
    target: { value: "Ana" },
  });
  fireEvent.change(screen.getByPlaceholderText("Priimek"), {
    target: { value: "Novak" },
  });

  fireEvent.click(screen.getByRole("button", { name: /Registracija/i }));

  const errorMessage = await screen.findByText(/Napaka pri povezovanju s strežnikom./i);
  expect(errorMessage).toBeInTheDocument();
});