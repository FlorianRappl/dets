import 'react';

export interface Props {
  jsx: JSX.Element;
  dom: DomProps;
}

interface DomProps {
  element: Element;
}
