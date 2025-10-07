import React, { Suspense } from "react";

import GamificationDisplay from "../gamification/GamificationDisplay";
import NavbarDropdownLinks from "../layout/NavbarDropdownLinks";
import {Button} from "@tbe/components";
import {NavbarProps} from "@tbe/interface";
import { SubscriptionInterestPopover } from "../popovers";

const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const Navbar: React.FC<NavbarProps> = ({username, onSignOut, userId}) => {
    return (
        <nav className='w-full bg-gray-900 border-b border-primary/20 px-4 py-3 flex items-center justify-between'>
            <div className='flex flex-col gap-1'>
                <span className='text-3xl font-bold text-primary'>
                    PrepYatra
                </span>
                <span className='text-xs text-white'>
                    By The Boring Education
                </span>
                    </div>
            <div className='flex items-center gap-4'>
                                    <SubscriptionInterestPopover />
                <NavbarDropdownLinks />
                                    {userId && <GamificationDisplay userId={userId} />}
                <span className='text-white font-medium hidden sm:inline'>
                </span>
                                    <Button
                                        onClick={onSignOut}
                                        text='Sign Out'
                                        variant='SUCCESS'
                                        className='border-gray-300 bg-black text-white hover:bg-gray-900'
                                        isLoading={false}
                                        animationType='BOUNCE'
                                        />
            </div>
        </nav>
    );
};

export default Navbar;  
