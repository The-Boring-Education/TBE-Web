import dynamic from 'next/dynamic';
import type { MainNavbarProps } from '@tbe/interface';

const Navbar = dynamic<MainNavbarProps>(
    () => import('@tbe/components').then((mod) => mod.Navbar),
    { ssr: false }
);

export default Navbar;
