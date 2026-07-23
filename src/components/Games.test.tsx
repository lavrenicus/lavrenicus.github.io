import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Games from "./Games";

vi.mock("@/data/projects", () => ({
  games: [
    { id: "one", title: "Demo One", demoKey: "one", demoAvailable: true },
    { id: "two", title: "Demo Two", demoKey: "two", demoAvailable: true },
    { id: "three", title: "Demo Three", demoKey: "three" },
  ],
}));

test("switches the embedded WebGL build with accessible tabs", async () => {
  const user = userEvent.setup();
  render(<Games />);

  expect(screen.getByRole("tab", { name: "Demo One" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByTitle("Demo One playable demo")).toHaveAttribute("src", "/demos/one/index.html");

  await user.click(screen.getByRole("tab", { name: "Demo Two" }));

  expect(screen.getByRole("tab", { name: "Demo Two" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByTitle("Demo Two playable demo")).toHaveAttribute("src", "/demos/two/index.html");

  await user.click(screen.getByRole("tab", { name: "Demo Three" }));
  expect(screen.getByText("build slot / awaiting export")).toBeInTheDocument();
});
