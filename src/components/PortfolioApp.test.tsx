import { beforeEach, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PortfolioApp from "./PortfolioApp";

vi.mock("./GridOverlay", () => ({ default: () => <canvas data-testid="backdrop" /> }));

beforeEach(() => {
  HTMLElement.prototype.scrollTo = vi.fn();
});

test("switches sections and updates breadcrumbs", async () => {
  const user = userEvent.setup();
  render(<PortfolioApp />);

  await user.click(screen.getByRole("button", { name: "projects" }));

  expect(screen.getByRole("heading", { name: "Featured projects" })).toBeInTheDocument();
  expect(screen.getAllByText("projects").some((node) => node.getAttribute("aria-current") === "page")).toBe(true);
  const panel = screen.getByTestId("content-panel");
  expect(panel).toHaveClass("lg:ml-[4vw]", "lg:mr-[18vw]");
  expect(panel.firstElementChild).toHaveClass("section-enter");
  expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({ top: 0 });
});

test("uses SPA navigation for hero calls to action", async () => {
  const user = userEvent.setup();
  render(<PortfolioApp />);

  await user.click(screen.getByRole("button", { name: "play demos" }));

  expect(screen.getByRole("heading", { name: "Playable demos" })).toBeInTheDocument();
});

test("opens and closes compact navigation", async () => {
  const user = userEvent.setup();
  render(<PortfolioApp />);
  const toggle = screen.getByRole("button", { name: "Toggle navigation" });

  await user.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  await user.click(screen.getAllByRole("button", { name: "about" }).at(-1)!);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
});
