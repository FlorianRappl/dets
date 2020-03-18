import './merge1';

declare module './merge1' {
  interface MyApi extends MyOtherApi, MyCustomApi {}
}

export interface MyCustomApi {}

interface MyOtherApi {
  bar: number;
}
