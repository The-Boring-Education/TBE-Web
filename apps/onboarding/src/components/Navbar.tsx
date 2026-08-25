import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="w-full mt-6 bg-white flex justify-center items-center h-14 px-4">
      <div className="flex items-center">
        <img
          src="https://ik.imagekit.io/tbe/webapp/logo.svg"
          alt="The Boring Education Logo"
          className="h-10 w-auto object-contain"
        />
      </div>
    </nav>
  );
};

export default Navbar;
