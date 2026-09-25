import { createContext, useContext } from "react";

export type TheaterState = {
  theater: boolean;
  setTheater: (value: boolean) => void;
};

/** Shell-level theater mode: the shell dims chrome, Games toggles it. */
export const TheaterContext = createContext<TheaterState>({
  theater: false,
  setTheater: () => {},
});

export const useTheater = () => useContext(TheaterContext);
