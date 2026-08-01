import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`panel-card ${className}`} style={{ padding: '1.5rem', ...props.style }} {...props}>
      {children}
    </div>
  );
}
