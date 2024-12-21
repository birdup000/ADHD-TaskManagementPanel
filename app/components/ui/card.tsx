import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ 
  className = '', 
  children,
  ...props 
}) => {
  return (
    <div
      className={`bg-[#222222] rounded-xl shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ 
  className = '', 
  children,
  ...props 
}) => {
  return (
    <div
      className={`p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ 
  className = '', 
  children,
  ...props 
}) => {
  return (
    <h3
      className={`text-lg font-semibold text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardProps> = ({ 
  className = '', 
  children,
  ...props 
}) => {
  return (
    <p
      className={`text-sm text-gray-400 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardProps> = ({ 
  className = '', 
  children,
  ...props 
}) => {
  return (
    <div
      className={`p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
