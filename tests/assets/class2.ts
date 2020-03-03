export class SomeClass {
  constructor(protected bar: boolean, private value: string) {}

  public foo() {
    return this.value;
  }

  private qxz() {
    return this.bar;
  }

  protected name = 'yo';
}
