const c = {
  d: 'hello',
} as const;

interface Bar {}

export interface Foo {
  [c.d]: Bar;
}
