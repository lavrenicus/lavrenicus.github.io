import { beforeEach, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import Shell from "./Shell";
import Hero from "./Hero";
import Games from "./Games";
import About from "./About";

const router = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => router.pathname,
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children?: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("./RunnerBackground", () => ({ default: () => <div data-testid="runner-backdrop" /> }));

beforeEach(() => {
  router.pathname = "/";
  HTMLElement.prototype.scrollTo = vi.fn();
});

test("renders the shell chrome and reacts to route changes", () => {
  const { container, rerender } = render(
    <Shell>
      <div data-testid="page">home</div>
    </Shell>,
  );

  expect(container.firstElementChild).toHaveClass("pb-[env(safe-area-inset-bottom)]");
  expect(container.querySelector(".hidden.md\\:block")).toBeTruthy();

  router.pathname = "/experience";
  rerender(
    <Shell>
      <div data-testid="page">experience</div>
    </Shell>,
  );

  expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({ top: 0 });
  const panel = screen.getByTestId("content-panel");
  expect(panel).toHaveClass(
    "mx-2",
    "rounded-[18px]",
    "sm:rounded-[22px]",
    "lg:ml-[4vw]",
    "lg:mr-[26vw]",
  );
  expect(panel.firstElementChild).toHaveClass("section-enter");
  expect(
    screen.getAllByText("experience").some((node) => node.getAttribute("aria-current") === "page"),
  ).toBe(true);
});

test("hero calls to action are real routes", () => {
  render(
    <Shell>
      <Hero />
    </Shell>,
  );

  expect(screen.getByRole("heading", { name: /Tools\. Pipelines\./ })).toHaveClass(
    "text-[clamp(2.15rem,11vw,6.5rem)]",
  );
  const work = screen.getByRole("link", { name: "view my work" });
  expect(work).toHaveAttribute("href", "/experience");
  expect(work.parentElement).toHaveClass("flex-col", "min-[390px]:flex-row");
  expect(screen.getByRole("link", { name: "play demos" })).toHaveAttribute("href", "/games");
  expect(screen.getByText("tty / build").closest("aside")?.querySelector("pre")).toHaveClass(
    "whitespace-pre-wrap",
  );
});

test("header navigation marks the current route", () => {
  router.pathname = "/about/";
  render(
    <Shell>
      <div />
    </Shell>,
  );

  for (const link of screen.getAllByRole("link", { name: "about" })) {
    expect(link).toHaveAttribute("aria-current", "page");
  }
  expect(screen.getAllByRole("link", { name: "games" })[0]).not.toHaveAttribute("aria-current");
  expect(screen.getByRole("link", { name: "Go to home" })).toHaveAttribute("href", "/");
});

test("opens and closes compact navigation", async () => {
  const user = userEvent.setup();
  render(
    <Shell>
      <About />
    </Shell>,
  );

  const toggle = screen.getByRole("button", { name: "Toggle navigation" });
  await user.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");

  await user.click(screen.getAllByRole("link", { name: "about" }).at(-1)!);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByText("base").closest("dl")).toHaveClass("min-[420px]:grid-cols-2");
});

test("enters and exits theater mode around the demo player", async () => {
  const user = userEvent.setup();
  render(
    <Shell>
      <Games />
    </Shell>,
  );

  await user.click(screen.getByRole("button", { name: "theater" }));
  expect(screen.getByTestId("theater-backdrop")).toBeInTheDocument();
  expect(screen.getByTestId("content-panel")).toHaveClass("z-40");

  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByTestId("theater-backdrop")).not.toBeInTheDocument();
  expect(screen.getByTestId("content-panel")).toHaveClass("z-10");

  await user.click(screen.getByRole("button", { name: "theater" }));
  await user.click(screen.getByTestId("theater-backdrop"));
  expect(screen.queryByTestId("theater-backdrop")).not.toBeInTheDocument();
});

test("toggles the live background from the footer", async () => {
  const user = userEvent.setup();
  render(
    <Shell>
      <div />
    </Shell>,
  );

  const toggle = screen.getByRole("button", { name: "bg: live" });
  expect(toggle).toHaveAttribute("aria-pressed", "true");

  await user.click(toggle);
  expect(screen.getByRole("button", { name: "bg: off" })).toHaveAttribute("aria-pressed", "false");

  await user.click(screen.getByRole("button", { name: "bg: off" }));
  expect(screen.getByRole("button", { name: "bg: live" })).toHaveAttribute("aria-pressed", "true");
});
