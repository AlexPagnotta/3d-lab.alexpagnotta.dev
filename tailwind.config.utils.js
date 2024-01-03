const BASE_FONT_SIZE_PX = 10;
const BROWSER_DEFAULT_FONT_SIZE_PX = 16;

const unitToPercent = (val) => `${val}%`;
const unitToRem = (val) => `${val}rem`;
const unitToPx = (val) => `${val}px`;
const pxToRem = (val) => val / BASE_FONT_SIZE_PX;
const pxUnitToRem = (val) => unitToRem(pxToRem(val));

const addPxSuffix = (val) => `${val}-px`;

const noop = (val) => val;
const createScale = ({ min = 0, max = 100, steps = 1, formatVal = noop, formatKey = noop }) => {
  const limit = Math.round((max - min) / steps);
  const scale = [...new Array(limit + 1)].map((_, i) => min + i * steps);

  return scale.reduce((prev, curr) => {
    const key = String(formatKey(curr));
    const val = curr === 0 ? String(curr) : formatVal(curr);
    return { ...prev, [key]: val };
  }, {});
};

const toFlatPropertyMap = (obj, keySeparator = "-") => {
  const flattenRecursive = (obj, parentProperty = undefined, propertyMap = {}) => {
    for (const [key, value] of Object.entries(obj)) {
      const property = parentProperty
        ? key.toLowerCase() === "default"
          ? parentProperty
          : `${parentProperty}${keySeparator}${key}`
        : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        flattenRecursive(value, property, propertyMap);
      } else {
        propertyMap[property] = value;
      }
    }
    return propertyMap;
  };
  return flattenRecursive(obj);
};

export default {
  baseFontSizePx: BASE_FONT_SIZE_PX,
  baseBrowserFontSizePx: BROWSER_DEFAULT_FONT_SIZE_PX,

  unitToPercent,
  unitToPx,
  unitToRem,
  pxToRem,
  pxUnitToRem,

  addPxSuffix,
  createScale,
  flatten: toFlatPropertyMap,
};
