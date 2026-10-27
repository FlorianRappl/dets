export declare function usePagination<T>(allItems: Array<T>): readonly [
  Array<T>,
  import('react').Dispatch<import('react').SetStateAction<number>>,
];
