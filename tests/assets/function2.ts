function ignored(): 'foo' {
  return 'foo';
}

export function foo<T>(a: string, b: T) {
  return {
    a,
    b,
  };
}

export function bar() {
  return ignored();
}
