"use client";

import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

interface BreadcrumbProps {
  items?: Array<{
    label: string;
    href?: string;
  }>;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items = [] }) => {
  return (
    <nav className="flex px-6 py-4 bg-background/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 animate-fade-in shadow-sm">
      <ol className="flex items-center space-x-2">
        <li>
          <a 
            href="/"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
              dark:hover:text-gray-300 text-sm"
          >
            Home
          </a>
        </li>
        
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <FaChevronRight className="text-gray-400 dark:text-gray-600" size={12} />
            <li>
              {item.href ? (
                <a 
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                    dark:hover:text-gray-300 text-sm"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                  {item.label}
                </span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;