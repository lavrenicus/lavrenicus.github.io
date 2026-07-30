import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import TechGrid from "./TechGrid";

test("stacks tech skills on narrow screens", () => {
  render(<TechGrid />);
  expect(screen.getByRole("list")).toHaveClass("grid-cols-1", "min-[380px]:grid-cols-2");
  expect(screen.getByText("Pipeline automation")).toHaveClass("break-words");
});
