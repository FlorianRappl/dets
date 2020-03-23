export interface Type {
  isUnion(): this is UnionType;
}

export interface UnionType {}
