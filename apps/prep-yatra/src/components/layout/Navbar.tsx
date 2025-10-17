import {Button} from "@tbe/components";
import type {NavbarProps} from "@tbe/interface";
import React from "react";

import {GamificationDisplay} from "../gamification";
import PrepYatraNavbarDropdownLinks from "../layout/NavbarDropdownLinks";
import { SubscriptionInterestPopover } from "../popovers";

const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const Navbar: React.FC<NavbarProps> = ({username, onSignOut, userId}) => {
    return (
        <nav className='w-full bg-white border-b border-greyLight shadow-sm px-3 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-50'>
            <div className='flex flex-col gap-1'>
                <span className='text-2xl font-bold text-primary'>
                    PrepYatra
                </span>
                <span className='text-[11px] text-greyDark'>
                    By The Boring Education
                </span>
            </div>
            <div className='flex items-center gap-3'>
                <SubscriptionInterestPopover />
                <PrepYatraNavbarDropdownLinks />
                {userId && <GamificationDisplay userId={userId} />}
                <span className='text-contentLight text-sm font-medium hidden sm:inline'>
                    Hello {capitalize(username)}
                </span>
                <Button
                    onClick={onSignOut}
                    variant='PRIMARY'
                    text='Sign Out'
                    className='px-3 py-1 text-sm' />
            </div>
        </nav>
    );
};

export default Navbar;
