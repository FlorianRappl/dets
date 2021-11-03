import { resolve } from 'path';
import { retrieveTypings } from '../src';

test('should be able to get exported types of enum', () => {
  const file = resolve(__dirname, 'assets', 'enum1.ts');
  const result = retrieveTypings({
    types: [file],
  });
  expect(result).toEqual([
    {
      comment: '',
      const: false,
      kind: 'enumLiteral',
      name: 'Foo',
      values: [
        {
          comment: '',
          kind: 'member',
          name: 'first',
          value: undefined,
        },
        {
          comment: '',
          kind: 'member',
          name: 'second',
          value: undefined,
        },
      ],
    },
  ]);
});

test('should be able to get exports from sub-modules', () => {
  const file = resolve(__dirname, 'assets', 'defaults1.ts');
  const result = retrieveTypings({
    types: [file],
  });
  expect(result).toEqual([
    {
      comment: '',
      kind: 'function',
      name: 'one',
      parameters: [],
      returnType: {
        kind: 'string',
      },
      types: [],
    },
    {
      comment: '',
      kind: 'function',
      name: 'two',
      parameters: [],
      returnType: {
        kind: 'string',
      },
      types: [],
    },
  ]);
});
