interface REACT_STATICS {}
interface KNOWN_STATICS {}
interface MEMO_STATICS {}
interface FORWARD_REF_STATICS {}

export type NonReactStatics<
  S extends React.ComponentType<any>,
  C extends {
    [key: string]: true;
  } = {}
> = {
  [key in Exclude<
    keyof S,
    S extends React.MemoExoticComponent<any>
      ? keyof MEMO_STATICS | keyof C
      : S extends React.ForwardRefExoticComponent<any>
      ? keyof FORWARD_REF_STATICS | keyof C
      : keyof REACT_STATICS | keyof KNOWN_STATICS | keyof C
  >]: S[key];
};
