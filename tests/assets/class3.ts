export class OtherClass<P, S> {}

export class SomeClass extends OtherClass<{}, {}> {
  public constructor() {
      super();
  }
}
