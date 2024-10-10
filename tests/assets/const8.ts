interface Props {
  children: any;
  className: string;
  a: number;
  b: boolean;
  c: string;
  d: Array<string>;
}

const BreadcrumbSeparator = ({ children, className, ...props }: Props) => className + Object.keys(props).join(',');
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

export { BreadcrumbSeparator };
