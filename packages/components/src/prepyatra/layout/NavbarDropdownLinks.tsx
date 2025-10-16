import React, {useState, useRef, useEffect} from "react";

import PrepYatraNavbarDropdownContainer from "./NavbarDropdownContainer";
import {links} from "@tbe/constants";
import { ChevronDown } from "lucide-react";
import { Button } from "@tbe/components";



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
      <Button
        variant="PRIMARY"
        text="Links"
        onClick={() => setOpen((v) => !v)}
        icon={<ChevronDown className="w-4 h-4" />}
        className="text-sm px-3 py-1.5"
      />
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