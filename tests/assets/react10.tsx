import * as React from 'react';

const SheetHeader = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="flex flex-col space-y-2 text-center sm:text-left" {...props} />
);
SheetHeader.displayName = 'SheetHeader';

export { SheetHeader };
