import type { MainNavbarProps } from "@tbe/interface";
import dynamic from "next/dynamic";

const Navbar = dynamic<MainNavbarProps>(
  () => import("@tbe/components").then((mod) => mod.Navbar),
  { ssr: false },
);

export default Navbar;
