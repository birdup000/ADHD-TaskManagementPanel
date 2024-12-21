import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-md transition-colors";
  const variantStyles = {
    default: "bg-indigo-600 hover:bg-indigo-700 text-white",
    outline: "border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
