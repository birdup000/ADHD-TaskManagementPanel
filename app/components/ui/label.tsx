import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ 
  className = '', 
  children,
  ...props 
}) => {
  return (
    <label
      className={`block text-sm font-medium text-gray-200 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};
