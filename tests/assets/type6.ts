export interface CustomMerged {}

export interface Merged extends CustomMerged {
  A: string;
  B: string;
}

export interface CustomMerged {
  C: string;
  D: string;
}

// The issue: `keyof Merged` becomes "A" | "B" | "C" | "D"
// Probably related to https://github.com/microsoft/TypeScript/issues/27171
export type MergedKeys = keyof Merged;

export const mergedParams = (key: MergedKeys) => false;
