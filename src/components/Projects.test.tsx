import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Projects from "./Projects";

test("separates personal and team projects", () => {
  render(<Projects />);
  const personal = screen.getByRole("heading", { name: "personal projects" }).closest("section")!;
  const team = screen.getByRole("heading", { name: "team projects" }).closest("section")!;

  expect(within(personal).getByText("NNRigger")).toBeInTheDocument();
  expect(within(team).getByText("SmartPool")).toBeInTheDocument();
});
