/**
 * Get a random item from an array
 * @param array The array to get a random item from
 * @returns The random item
 */
export const getRandomItemFromArray = <T, _>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)] as T;
};

export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Get a random number between min and max
 * @param min The minimum number
 * @param max The maximum number
 * @returns The random number
 */
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
