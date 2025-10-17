import type {NavbarDropdownContainerProps} from "@tbe/interface";

const PrepYatraNavbarDropdownContainer = ({links}: NavbarDropdownContainerProps) => (
    <div className='p-2 glass rounded-xl shadow-lg border border-greyLight z-[1000] min-w-[220px]'>
        {links.map(({name, href, description, target, isDevelopment}) => (
            <div
                key={name}
                className='relative rounded-lg p-3 hover:bg-primary/10 max-w-sm transition-colors mb-1 last:mb-0 cursor-pointer'>
                <a
                    className='block text-base font-semibold text-primary hover:text-primary/80 transition-colors pr-2'
                    href={href}
                    target={target || "_blank"}
                    rel='noopener noreferrer'>
                    {name}{" "}
                    {isDevelopment && (
                        <span className='text-secondary'>(In Dev)</span>
                    )}
                    <span className='absolute inset-0' />
                </a>
                <p className='text-greyDark break-words text-sm mt-1'>
                    {description}
                </p>
            </div>
        ))}
    </div>
);

export default PrepYatraNavbarDropdownContainer;
