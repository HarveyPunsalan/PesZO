/**
 * Box-Muller transform converts two uniform random numbers into one
 * normally distributed sample. No external library needed for this.
 */
export const gaussianRandom = (mean: number, stdDev: number): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
};

/**
 * Constrains a numeric value to lie within [min, max].
 * Used to prevent economic indicators from drifting into
 * unrealistic ranges across repeated random walks.
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
