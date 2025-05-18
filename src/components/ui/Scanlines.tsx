import React from 'react';

interface ScanlinesProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Scanlines({ children, className = "" }: ScanlinesProps) {
  return <div className={`scanlines ${className}`}>{children}</div>;
} 