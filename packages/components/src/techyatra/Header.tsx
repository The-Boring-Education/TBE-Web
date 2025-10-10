
import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center">
          <div className="cursor-pointer">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              TechYatra
            </h1>
            <p className="text-xs text-gray-500 font-medium">By The Boring Education</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
