import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'success';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  let btnClass = 'btn-primary';
  if (variant === 'outline') btnClass = 'btn-outline';
  
  // Inline styles for colors not mapped to global css classes yet
  let style: React.CSSProperties = {};
  if (variant === 'danger') {
    style = { background: 'var(--state-error)', color: 'white', border: 'none' };
  } else if (variant === 'success') {
    style = { background: 'var(--state-success)', color: 'white', border: 'none' };
  }

  return (
    <button 
      className={`btn-primary ${btnClass} ${className}`} 
      style={{...style, ...props.style}}
      {...props}
    >
      {children}
    </button>
  );
}
