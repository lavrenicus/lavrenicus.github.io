import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Projects from "./Projects";

test("lists each project with its own scope", () => {
  render(<Projects />);
  const cards = screen.getAllByRole("article");

  expect(screen.queryByRole("heading", { name: "personal projects" })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "team projects" })).not.toBeInTheDocument();
  expect(within(cards[0]).getByText("Sharks vs Dolphins: Underwater Battle Checkers")).toBeInTheDocument();
  expect(within(cards[0]).getByText("team")).toBeInTheDocument();
  expect(within(cards[0]).getByText("2014")).toBeInTheDocument();
  expect(within(cards[5]).getByText("ImmerseRender")).toBeInTheDocument();
  expect(within(cards[5]).getByText("2024–2026")).toBeInTheDocument();
  expect(within(cards[5]).getByText("render farm operations · 3D production")).toBeInTheDocument();
  expect(within(cards[6]).getByText("SmartPool")).toBeInTheDocument();
  expect(within(cards[6]).getByText("team")).toBeInTheDocument();
  expect(within(cards[7]).getByText("NNRigger")).toBeInTheDocument();
  expect(within(cards[7]).getByText("personal")).toBeInTheDocument();
});
