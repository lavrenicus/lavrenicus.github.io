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
  const { container } = render(<PortfolioApp />);

  await user.click(screen.getByRole("button", { name: "experience" }));

  expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
  expect(screen.getAllByText("experience").some((node) => node.getAttribute("aria-current") === "page")).toBe(true);
  expect(container.querySelector(".hidden.md\\:block")).toBeTruthy();
  expect(container.firstElementChild).toHaveClass("pb-[env(safe-area-inset-bottom)]");
  const panel = screen.getByTestId("content-panel");
  expect(panel).toHaveClass("mx-2", "rounded-[18px]", "sm:rounded-[22px]", "lg:ml-[4vw]", "lg:mr-[26vw]");
  expect(panel.firstElementChild).toHaveClass("section-enter");
  expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({ top: 0 });
});

test("uses SPA navigation for hero calls to action", async () => {
  const user = userEvent.setup();
  render(<PortfolioApp />);
  expect(screen.getByRole("heading", { name: /Tools\. Pipelines\./ })).toHaveClass("text-[clamp(2.15rem,11vw,6.5rem)]");
  expect(screen.getByRole("button", { name: "view my work" }).parentElement).toHaveClass("flex-col", "min-[390px]:flex-row");
  expect(screen.getByText("tty / build").closest("aside")?.querySelector("pre")).toHaveClass("whitespace-pre-wrap");

  await user.click(screen.getByRole("button", { name: "play demos" }));

  expect(screen.getByRole("heading", { name: "Playable demos" })).toBeInTheDocument();
  expect(screen.getByRole("tablist")).toHaveClass("flex-col");
});

test("opens and closes compact navigation", async () => {
  const user = userEvent.setup();
  render(<PortfolioApp />);
  const toggle = screen.getByRole("button", { name: "Toggle navigation" });

  await user.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("navigation", { name: "Mobile" })).toHaveClass("z-30", "bg-[#080b12]/95");
  await user.click(screen.getByRole("button", { name: "Close navigation" }));
  expect(toggle).toHaveAttribute("aria-expanded", "false");

  await user.click(toggle);
  await user.click(screen.getAllByRole("button", { name: "about" }).at(-1)!);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByText("base").closest("dl")).toHaveClass("min-[420px]:grid-cols-2");
});
