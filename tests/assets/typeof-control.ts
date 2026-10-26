export declare class Control<Options = string> {
  static extend<Options>(): typeof Control<Options>;
}

export namespace Control {
  export interface Options {
    position: string;
  }
}
