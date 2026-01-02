// frontend/src/pages/Login.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import "@testing-library/jest-dom";

// mock AnimationRevealPage, da se znebimo animacij v testih
jest.mock("helpers/AnimationRevealPage.js", () => ({ children }) => <>{children}</>);

// mock useNavigate iz react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  window.localStorage.clear();
});

test("prikaže obrazec za prijavo (email, geslo, gumb)", () => {
  console.log("🧪 LOGIN: preverjam, da se obrazec s polji in gumbom pravilno izriše");

  render(<Login />);

  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/geslo/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /prijava/i })).toBeInTheDocument();
});

test("ob uspešni prijavi shrani token in preusmeri na domačo stran", async () => {
  console.log("🧪 LOGIN: uspešna prijava — shrani token v localStorage in redirecta na /");

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ token: "TEST_TOKEN" }),
  });

  render(<Login />);

  fireEvent.change(screen.getByPlaceholderText(/email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/geslo/i), {
    target: { value: "Geslo123" },
  });

  fireEvent.click(screen.getByRole("button", { name: /prijava/i }));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/uporabniki/login`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(window.localStorage.getItem("authToken")).toBe("TEST_TOKEN");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});

test("pri neveljavni prijavi (401) prikaže napako iz backenda", async () => {
  console.log("🧪 LOGIN: neveljavna prijava — backend vrne 401, UI mora prikazati napako");

  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Neveljavna prijava." }),
  });

  render(<Login />);

  fireEvent.change(screen.getByPlaceholderText(/email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/geslo/i), {
    target: { value: "narobe" },
  });

  fireEvent.click(screen.getByRole("button", { name: /prijava/i }));

  const errorMessage = await screen.findByText(/neveljavna prijava/i);
  expect(errorMessage).toBeInTheDocument();
});

test("pri napaki omrežja prikaže sporočilo o napaki pri povezovanju", async () => {
  console.log("🧪 LOGIN: napaka omrežja — UI mora prikazati 'Napaka pri povezovanju s strežnikom.'");

  global.fetch.mockRejectedValueOnce(new Error("Network error"));

  render(<Login />);

  fireEvent.change(screen.getByPlaceholderText(/email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/geslo/i), {
    target: { value: "Geslo123" },
  });

  fireEvent.click(screen.getByRole("button", { name: /prijava/i }));

  const errorMessage = await screen.findByText(/Napaka pri povezovanju s strežnikom./i);
  expect(errorMessage).toBeInTheDocument();
});