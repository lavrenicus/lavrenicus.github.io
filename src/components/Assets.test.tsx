import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Assets from "./Assets";

test("renders every Sketchfab asset with its cover and link", () => {
  render(<Assets />);
  const cards = screen.getAllByRole("link");

  expect(cards).toHaveLength(8);
  expect(cards.map(({ textContent }) => textContent)).toEqual(expect.arrayContaining([
    expect.stringContaining("Sci-fi Corridor"),
    expect.stringContaining("Supermutant"),
    expect.stringContaining("Orc"),
    expect.stringContaining("Swamp Creature"),
    expect.stringContaining("Goalkeeper"),
    expect.stringContaining("Wizard"),
    expect.stringContaining("Knight"),
    expect.stringContaining("Sci-fi Girl"),
  ]));
  expect(cards[0]).toHaveAttribute("href", expect.stringContaining("f4c18c0c955a46d8b7327091725a915e"));
  expect(cards[0].firstElementChild).toHaveStyle({ backgroundImage: "url(/images/sketchfab/sci-fi-corridor.jpg)" });
});
