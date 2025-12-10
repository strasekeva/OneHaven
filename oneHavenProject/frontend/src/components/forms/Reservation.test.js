// frontend/src/components/forms/Reservation.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Reservation from "./Reservation";
import "@testing-library/jest-dom";

// Mock react-calendar, da ne rendera pravega koledarja v testih
jest.mock("react-calendar", () => (props) => (
  <div data-testid="mock-calendar">Calendar komponenta</div>
));

// mock useNavigate
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

test("če uporabnik ni prijavljen, prikaže napako in ne pošlje rezervacije", async () => {
  console.log("🧪 RESERVATION: brez JWT tokena — prikaže napako in ne kliče POST /api/rezervacije");

  // 1. klic fetch — zasedeni datumi
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  });

  render(<Reservation />);

  fireEvent.change(screen.getByLabelText(/Število odraslih/i), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText(/Število otrok/i), {
    target: { value: "1" },
  });

  fireEvent.click(screen.getByRole("button", { name: /Rezerviraj zdaj/i }));

  const errorMessage = await screen.findByText(/Morate biti prijavljeni za rezervacijo./i);
  expect(errorMessage).toBeInTheDocument();

  // preverimo, da je bil klican samo GET (zasedeni datumi), ne POST rezervacija
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test("ob uspešni rezervaciji z JWT tokenom pokliče API in preusmeri na domačo stran", async () => {
  console.log("🧪 RESERVATION: uspešna rezervacija z JWT — klic POST + navigate na /");

  window.localStorage.setItem("authToken", "TEST_TOKEN");

  // 1. GET zasedeni datumi
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })
    // 2. POST rezervacija
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reservation: { price: 375 },
      }),
    });

  render(<Reservation />);

  fireEvent.change(screen.getByLabelText(/Število odraslih/i), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText(/Število otrok/i), {
    target: { value: "1" },
  });

  fireEvent.click(screen.getByRole("button", { name: /Rezerviraj zdaj/i }));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith(
      "http://localhost:5050/api/rezervacije",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer TEST_TOKEN",
        }),
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});

test("pri napaki iz backenda pri rezervaciji prikaže sporočilo o napaki", async () => {
  console.log("🧪 RESERVATION: backend vrne napako pri POST /api/rezervacije — UI mora prikazati napako");

  window.localStorage.setItem("authToken", "TEST_TOKEN");

  // 1. GET zasedeni datumi
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })
    // 2. POST rezervacija - error
    .mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Napaka pri oddaji rezervacije." }),
    });

  render(<Reservation />);

  fireEvent.change(screen.getByLabelText(/Število odraslih/i), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText(/Število otrok/i), {
    target: { value: "1" },
  });

  fireEvent.click(screen.getByRole("button", { name: /Rezerviraj zdaj/i }));

  const errorMessage = await screen.findByText(/Napaka pri oddaji rezervacije./i);
  expect(errorMessage).toBeInTheDocument();
});