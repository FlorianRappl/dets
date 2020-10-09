interface Dictionary<T> {
  [Key: string]: T;
}

export class MyTree implements Dictionary<MyElement[]> {
  [Key: string]: MyElement[]
}
