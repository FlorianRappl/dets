import { runTestFor } from './helper';

test('should be able to handle type fest delimiters', () => {
  const result = runTestFor('type-fest1.ts');
  expect(result).toBe(`declare module "test" {
  export type UpperCaseCharacters = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";

  export type WordSeparators = "-" | "_" | " ";

  export type StringDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

  export type SplitIncludingDelimiters<Source extends string, Delimiter extends string> = Source extends "" ? [] : Source extends \`\${infer FirstPart}\${Delimiter}\${infer SecondPart}\` ? Source extends \`\${FirstPart}\${infer UsedDelimiter}\${SecondPart}\` ? UsedDelimiter extends Delimiter ? Source extends \`\${infer FirstPart}\${UsedDelimiter}\${infer SecondPart}\` ? [...SplitIncludingDelimiters<FirstPart, Delimiter>, UsedDelimiter, ...SplitIncludingDelimiters<SecondPart, Delimiter>] : never : never : never : [Source];

  export type DelimiterCase<Value, Delimiter extends string> = Value extends string ? StringArrayToDelimiterCase<SplitIncludingDelimiters<Value, WordSeparators | UpperCaseCharacters>, true, WordSeparators, UpperCaseCharacters, Delimiter> : Value;

  export type StringArrayToDelimiterCase<Parts extends readonly any[], Start extends boolean, UsedWordSeparators extends string, UsedUpperCaseCharacters extends string, Delimiter extends string> = Parts extends [\`\${infer FirstPart}\`, ...infer RemainingParts] ? \`\${StringPartToDelimiterCase<FirstPart, Start, UsedWordSeparators, UsedUpperCaseCharacters, Delimiter>}\${StringArrayToDelimiterCase<RemainingParts, false, UsedWordSeparators, UsedUpperCaseCharacters, Delimiter>}\` : "";

  export type StringPartToDelimiterCase<StringPart extends string, Start extends boolean, UsedWordSeparators extends string, UsedUpperCaseCharacters extends string, Delimiter extends string> = StringPart extends UsedWordSeparators ? Delimiter : Start extends true ? Lowercase<StringPart> : StringPart extends UsedUpperCaseCharacters ? \`\${Delimiter} \${Lowercase<StringPart>}\` : StringPart;
}`);
});
