import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'draft' | 'processing' | 'approved' | 'released' | 'error' | 'warning' | 'success';
}

export function Badge({ status, className = '', children, ...props }: BadgeProps) {
  let badgeClass = 'badge-tag ';
  switch (status) {
    case 'draft':
    case 'processing':
      badgeClass += 'badge-accent';
      break;
    case 'approved':
    case 'released':
    case 'success':
      badgeClass += 'badge-success';
      break;
    case 'error':
      badgeClass += 'badge-error';
      break;
    case 'warning':
      badgeClass += 'badge-warning';
      break;
  }

  return (
    <span className={`${badgeClass} ${className}`} {...props}>
      {children || status}
    </span>
  );
}
