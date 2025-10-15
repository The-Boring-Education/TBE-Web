import type {NavbarDropdownContainerProps} from "@/interfaces/components";

const NavbarDropdownContainer = ({links}: NavbarDropdownContainerProps) => (
    <div className='p-2 bg-gray-900 rounded-xl shadow-lg border border-primary z-[1000] min-w-[220px]'>
        {links.map(({name, href, description, target, isDevelopment}) => (
            <div
                key={name}
                className='relative rounded-lg p-3 hover:bg-primary/10 max-w-sm transition-colors mb-1 last:mb-0 cursor-pointer'>
                <a
                    className='block text-base font-semibold text-primary hover:text-yellow-400 transition-colors pr-2'
                    href={href}
                    target={target || "_blank"}
                    rel='noopener noreferrer'>
                    {name}{" "}
                    {isDevelopment && (
                        <span className='text-secondary'>(In Dev)</span>
                    )}
                    <span className='absolute inset-0' />
                </a>
                <p className='text-gray break-words text-sm mt-1'>
                    {description}
                </p>
            </div>
        ))}
    </div>
);

export default NavbarDropdownContainer;
