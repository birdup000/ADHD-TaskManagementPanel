"use client";

import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-[#111111] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-2xl font-bold text-white mb-4">Loading...</div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
