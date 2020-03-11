export class OtherClass<P, S = {}> {}

export interface OtherInterface<P> {}

export class SomeClass extends OtherClass<{}> implements OtherInterface<{}> {
  public constructor() {
    super();
  }
}
