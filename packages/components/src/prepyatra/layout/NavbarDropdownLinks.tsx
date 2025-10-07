import React, {useState, useRef, useEffect} from "react";

import PrepYatraNavbarDropdownContainer from "./NavbarDropdownContainer";
import {links} from "@tbe/constants";



const PrepYatraNavbarDropdownLinks: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {setOpen(false);}
    }
    if (open) {document.addEventListener("mousedown", handleClick);}
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="px-3 py-1 rounded-md font-semibold text-primary bg-gray-900 border border-primary hover:bg-primary hover:text-gray-900 transition-colors"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
      >
        Links <span className="ml-1">&#9662;</span>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 z-[1000]"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <PrepYatraNavbarDropdownContainer links={links} />
        </div>
      )}
    </div>
  );
};

export default PrepYatraNavbarDropdownLinks; 