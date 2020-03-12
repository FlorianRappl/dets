export interface Foo {
  createDataProvider<TItem extends {}, TReducers extends DataProviderReducers<TItem>>(
    options: DataProviderOptions<TItem, TReducers>,
  ): DataConnector<TItem, TReducers>;
}

interface DataProviderReducers<TItem> {
  [name: string]: {
    (data: DataProviderState<TItem>, ...args: any): DataProviderState<TItem>;
  };
}

interface DataProviderState<TItem> {
  current: Array<TItem>;
}

interface DataProviderOptions<TItem, TReducers> {
  searchData(query: string): Promise<Array<TItem>>;
  reducers?: TReducers;
}

type DataConnector<TItem, TReducers> = GetActions<TReducers> & {
  get(id: string): TItem;
};

type GetActions<TActions> = {
  [P in keyof TActions]: {
    (...args: RemainingArgs<TActions[P]>): void;
  };
};

type RemainingArgs<T> = T extends {
  (_: any, ...args: infer U): any;
}
  ? U
  : never;
