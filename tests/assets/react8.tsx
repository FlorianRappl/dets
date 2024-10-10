import * as React from 'react';

interface PaginationLinkProps {
  className: string;
  isActive: boolean;
  size: string;
  other: string;
}

const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => <div />;
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => <div />;
PaginationPrevious.displayName = 'PaginationPrevious';

export { PaginationLink, PaginationPrevious };
