import { afterEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import Games from "./Games";
import { TheaterContext } from "./theater-context";

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
  expect(screen.getByRole("tablist")).toHaveClass("flex-col");
  expect(screen.getByTitle("Demo One playable demo")).toHaveAttribute("src", "/demos/one/index.html");

  await user.click(screen.getByRole("tab", { name: "Demo Two" }));

  expect(screen.getByRole("tab", { name: "Demo Two" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByTitle("Demo Two playable demo")).toHaveAttribute("src", "/demos/two/index.html");

  await user.click(screen.getByRole("tab", { name: "Demo Three" }));
  expect(screen.getByText("build slot / awaiting export")).toBeInTheDocument();
});

function TheaterHarness() {
  const [theater, setTheater] = useState(false);
  return (
    <TheaterContext.Provider value={{ theater, setTheater }}>
      <Games />
    </TheaterContext.Provider>
  );
}

test("toggles theater mode and exits on escape", async () => {
  const user = userEvent.setup();
  render(<TheaterHarness />);

  await user.click(screen.getByRole("button", { name: "theater" }));
  expect(screen.getByRole("button", { name: "exit theater" })).toHaveAttribute("aria-pressed", "true");

  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.getByRole("button", { name: "theater" })).toHaveAttribute("aria-pressed", "false");
});

describe("fullscreen capability", () => {
  afterEach(() => {
    Object.defineProperty(document, "fullscreenEnabled", { value: undefined, configurable: true });
    vi.restoreAllMocks();
  });

  test("shows an explicit disabled state when the platform has no fullscreen", () => {
    render(<Games />);
    const button = screen.getByRole("button", { name: "Enter fullscreen" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("title", "fullscreen unavailable on this platform");
  });

  test("requests fullscreen on the demo iframe when supported", async () => {
    Object.defineProperty(document, "fullscreenEnabled", { value: true, configurable: true });
    const user = userEvent.setup();
    render(<Games />);

    const button = screen.getByRole("button", { name: "Enter fullscreen" });
    expect(button).not.toBeDisabled();

    const frame = screen.getByTitle("Demo One playable demo");
    const request = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(frame, "requestFullscreen", { value: request, configurable: true });

    await user.click(button);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
  });

  test("surfaces a visible error when the fullscreen request fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    Object.defineProperty(document, "fullscreenEnabled", { value: true, configurable: true });
    const user = userEvent.setup();
    render(<Games />);

    const frame = screen.getByTitle("Demo One playable demo");
    Object.defineProperty(frame, "requestFullscreen", {
      value: vi.fn().mockRejectedValue(new Error("blocked")),
      configurable: true,
    });

    await user.click(screen.getByRole("button", { name: "Enter fullscreen" }));
    expect(await screen.findByRole("status")).toHaveTextContent("fullscreen error");
    expect(console.error).toHaveBeenCalled();
  });
});
