import type { CSSProperties } from "react";

/** Sets the --hue custom property used to colour a topic's bars, cells and checkboxes. */
export const hueVar = (hue: number): CSSProperties => ({ ["--hue" as string]: hue }) as CSSProperties;
