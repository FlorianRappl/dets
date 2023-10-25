import { FC } from 'react';
import { ExtensionComponentProps } from './pilet-shell';

interface MyParams {
  num: number;
}

const Component: FC<ExtensionComponentProps<MyParams>> = () => {
  return null;
};

export default Component;
