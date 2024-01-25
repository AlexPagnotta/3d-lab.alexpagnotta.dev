import defaultTheme from "tailwindcss/defaultTheme";
import addPlugin from "tailwindcss/plugin";

import {
  baseFontSizePx,
  baseBrowserFontSizePx,
  unitToPercent,
  unitToPx,
  pxUnitToRem,
  addPxSuffix,
  createScale,
  flatten,
} from "./tailwind.config.utils";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      white: "#FFFFFF",
      black: "#424242",
      transparent: "transparent",
      current: "currentColor",
    },
    spacing: {
      // Create spacing scale with rem units
      ...createScale({ max: 32, steps: 1, formatVal: pxUnitToRem }),
      ...createScale({ min: 32, max: 64, steps: 2, formatVal: pxUnitToRem }),
      ...createScale({ min: 68, max: 128, steps: 4, formatVal: pxUnitToRem }),
      ...createScale({ min: 136, max: 256, steps: 8, formatVal: pxUnitToRem }),
      ...createScale({ min: 272, max: 512, steps: 16, formatVal: pxUnitToRem }),
      ...createScale({ min: 544, max: 1024, steps: 32, formatVal: pxUnitToRem }),

      // Recreate same scale but with px units
      ...createScale({ max: 32, steps: 1, formatKey: addPxSuffix, formatVal: unitToPx }),
      ...createScale({ min: 32, max: 64, steps: 2, formatKey: addPxSuffix, formatVal: unitToPx }),
      ...createScale({ min: 68, max: 128, steps: 4, formatKey: addPxSuffix, formatVal: unitToPx }),
      ...createScale({ min: 136, max: 256, steps: 8, formatKey: addPxSuffix, formatVal: unitToPx }),
      ...createScale({ min: 272, max: 512, steps: 16, formatKey: addPxSuffix, formatVal: unitToPx }),
      ...createScale({ min: 544, max: 1024, steps: 32, formatKey: addPxSuffix, formatVal: unitToPx }),
    },
    fontFamily: {
      serif: ["Literata", ...defaultTheme.fontFamily.serif],
      sans: ["Merriweather", ...defaultTheme.fontFamily.sans],
    },
    // TODO: Update
    fontSize: {
      ...flatten({
        "title-1": {
          DEFAULT: [pxUnitToRem(32), { lineHeight: 1.5, letterSpacing: "-0.01em" }],
          desktop: [pxUnitToRem(36), { lineHeight: 1.5, letterSpacing: "-0.01em" }],
        },
        "title-2": {
          DEFAULT: [pxUnitToRem(28), { lineHeight: 1.5, letterSpacing: "-0.01em" }],
          desktop: [pxUnitToRem(30), { lineHeight: 1.5, letterSpacing: "-0.01em" }],
        },
        "title-3": {
          DEFAULT: [pxUnitToRem(26), { lineHeight: 1.5 }],
          desktop: [pxUnitToRem(26), { lineHeight: 1.5 }],
        },
        "title-4": {
          DEFAULT: [pxUnitToRem(22), { lineHeight: 1.6 }],
          desktop: [pxUnitToRem(22), { lineHeight: 1.6 }],
        },

        "body-4": {
          DEFAULT: [pxUnitToRem(20), { lineHeight: 1.8 }],
          desktop: [pxUnitToRem(20), { lineHeight: 1.8 }],
        },
        "body-3": {
          DEFAULT: [pxUnitToRem(16), { lineHeight: 1.8 }],
          desktop: [pxUnitToRem(16), { lineHeight: 1.8 }],
        },
        "body-2": {
          DEFAULT: [pxUnitToRem(14), { lineHeight: 1.8 }],
          desktop: [pxUnitToRem(14), { lineHeight: 1.8 }],
        },
        "body-1": {
          DEFAULT: [pxUnitToRem(12), { lineHeight: 1.8 }],
          desktop: [pxUnitToRem(12), { lineHeight: 1.8 }],
        },
      }),
    },
    fontWeight: {
      light: 300,
      regular: 400,
    },
    borderRadius: {
      none: "0px",
      md: "0.8rem",
      full: "9999px",
    },
    backdropBlur: {
      md: "10px",
    },
    extend: {
      screens: {
        "hover-supported": { raw: "(hover: hover)" },
      },
    },
  },
  plugins: [
    addPlugin(function ({ addBase, theme }) {
      addBase({
        ":root": {
          fontSize: unitToPercent((baseFontSizePx / baseBrowserFontSizePx) * 100),
        },
      });
    }),
  ],
};
