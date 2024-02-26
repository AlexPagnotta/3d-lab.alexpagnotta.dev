/**
 * NOTE: Keep this in sync with the (custom) Tailwind theme `screens` config.
 * @see https://tailwindcss.com/docs/breakpoints
 */
export const screens = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export type Screen = keyof typeof screens;

// Exclude "hover-supported" screen query
const screenKeys = Object.keys(screens).filter((key) => key !== "hover-supported") as Screen[];

// The maximum value is calculated as the minimum of the next one less 0.02px.
// @see https://www.w3.org/TR/mediaqueries-4/#mq-min-max
const getNextBpValue = (bp: string) => {
  return `${parseInt(bp) - 0.02}px`;
};

export const up = (bp: Screen) => {
  const screen = screens[bp];
  return `@media only screen and (min-width: ${screen})`;
};

export const down = (bp: Screen) => {
  const screen = getNextBpValue(screens[bp]);
  return `@media only screen and (max-width: ${screen})`;
};

export const between = (bpMin: Screen, bpMax: Screen) => {
  const screenMin = screens[bpMin];
  const screenMax = getNextBpValue(screens[bpMax]);
  return `@media only screen and (min-width: ${screenMin}) and (max-width: ${screenMax})`;
};

export const only = (bp: Screen) => {
  const currentKeyIndex = screenKeys.indexOf(bp);
  const nextBp = screenKeys[currentKeyIndex + 1];
  return nextBp ? between(bp, nextBp) : up(bp);
};
