type RGB = readonly [red: number, green: number, blue: number];
type Color = RGB | string;

export const myColor = 'red' satisfies Color; // works
