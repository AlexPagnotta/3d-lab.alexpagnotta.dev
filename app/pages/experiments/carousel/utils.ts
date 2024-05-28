import { type MotionValue } from "framer-motion";

/**
 * Calculate the overlap between two items
 * @param item1Width The width of the first item
 * @param item2Width The width of the second item
 * @param distanceBetweenItemsCenters The distance between the centers of the two items
 * @returns The overlap between the two items in px
 */
export const calculateOverlap = (item1Width: number, item2Width: number, distanceBetweenItemsCenters: number) => {
  const overlap = item1Width / 2 + item2Width / 2 - Math.abs(distanceBetweenItemsCenters);
  return overlap > 0 ? overlap : 0;
};

/**
 * Set the value of a motion value
 * @param motionValue The motion value to set
 * @param newValue The new value to set
 * @param instant If true, the value will be set without animation
 */
export const setMotionValue = <T>(motionValue: MotionValue<T>, newValue: T, instant?: boolean) => {
  instant ? motionValue.jump(newValue) : motionValue.set(newValue);
};
