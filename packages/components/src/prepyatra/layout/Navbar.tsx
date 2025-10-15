import React, { Suspense } from "react";

import GamificationDisplay from "../gamification/GamificationDisplay";
import NavbarDropdownLinks from "../layout/NavbarDropdownLinks";
import {Button} from "@tbe/components";
import type {NavbarProps} from "@tbe/interface";
import { SubscriptionInterestPopover } from "../popovers";

const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const Navbar: React.FC<NavbarProps> = ({username, onSignOut, userId}) => {
    return (
        <nav className='fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-greyLight shadow-sm px-4 py-2.5 flex items-center justify-between'>
            <div className='flex flex-col gap-0'>
                <span className='text-2xl font-bold text-primary leading-tight'>
                    PrepYatra
                </span>
                <span className='text-[10px] text-greyDark -mt-0.5'>
                    By The Boring Education
                </span>
                    </div>
            <div className='flex items-center gap-3'>
                                    <SubscriptionInterestPopover />
                <NavbarDropdownLinks />
                                    {userId && <GamificationDisplay userId={userId} />}
                <span className='text-contentLight font-medium hidden sm:inline' />
                                    <Button
                                        onClick={onSignOut}
                                        text='Sign Out'
                                        variant='PRIMARY'
                                        className='text-sm px-3 py-1.5'
                                        isLoading={false}
                                        animationType='BOUNCE'
                                        />
            </div>
        </nav>
    );
};

export default Navbar;  
