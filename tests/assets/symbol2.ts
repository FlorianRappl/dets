export interface String {
    split(splitter: { [Symbol.split](string: string, limit?: number): string[]; }, limit?: number): string[];
}
