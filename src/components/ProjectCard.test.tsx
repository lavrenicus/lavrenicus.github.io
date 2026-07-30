import { beforeEach, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProjectCard, { calculateTilt } from "./ProjectCard";

const project = {
  id: "demo",
  title: "Demo",
  meta: "WebGL",
  description: "Description",
  stack: ["TypeScript"],
  scope: "personal" as const,
  year: 2014,
  period: "2014–2016",
  images: [{ src: "/images/demo.png", alt: "Demo screenshot" }],
  links: [{ href: "https://example.com/details", label: "Details" }],
};

beforeEach(() => {
  vi.mocked(window.matchMedia).mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

test("calculates a subtle bounded tilt", () => {
  const rect = new DOMRect(10, 20, 100, 200);
  expect(calculateTilt(rect, 110, 20)).toEqual({ x: 2.5, y: 2.5 });
});

test("renders project date, scope and screenshots", () => {
  const { container } = render(<ProjectCard project={project} index={1} />);
  expect(screen.getByText("2014–2016")).toBeInTheDocument();
  expect(screen.getByText("personal")).toBeInTheDocument();
  expect(container.querySelector("article > div")).toHaveClass("flex-wrap");
  expect(screen.getByText("WebGL")).toHaveClass("break-words");
  expect(screen.getByRole("img", { name: "Demo screenshot" })).toHaveAttribute("src", expect.stringContaining("demo.png"));
  expect(screen.getByRole("link", { name: "Details →" })).toHaveAttribute("href", "https://example.com/details");
});

test("applies and resets pointer tilt", async () => {
  const { container } = render(<ProjectCard project={project} index={1} />);
  const card = container.querySelector("article")!;
  vi.spyOn(card, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 100, 100));

  fireEvent.pointerMove(card, { clientX: 100, clientY: 0 });
  await waitFor(() => expect(card.style.getPropertyValue("--tilt-y")).toBe("2.5deg"));
  fireEvent.pointerLeave(card);

  expect(card.style.getPropertyValue("--tilt-x")).toBe("0deg");
  expect(card.style.getPropertyValue("--tilt-y")).toBe("0deg");
});

test("does not tilt when reduced motion is enabled", () => {
  vi.mocked(window.matchMedia).mockImplementation((query) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  const { container } = render(<ProjectCard project={project} index={1} />);
  const card = container.querySelector("article")!;
  fireEvent.pointerMove(card, { clientX: 100, clientY: 0 });
  expect(card.style.getPropertyValue("--tilt-y")).toBe("");
});
