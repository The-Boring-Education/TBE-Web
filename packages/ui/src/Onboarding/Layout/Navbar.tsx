import React from 'react';
import logo from '../assets/logo.svg';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full mt-6 bg-white flex justify-center items-center h-14 px-4">
      <div className="flex items-center">
        <img src={logo} alt="Boring Education Logo" className="h-14 w-14" />
      </div>
    </nav>
  );
};

export default Navbar;
