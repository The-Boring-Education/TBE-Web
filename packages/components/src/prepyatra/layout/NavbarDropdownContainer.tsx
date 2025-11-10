import type {NavbarDropdownContainerProps} from "@tbe/interface";

const PrepYatraNavbarDropdownContainer = ({links}: NavbarDropdownContainerProps) => (
    <div className='p-2 bg-white rounded-2xl shadow-lg border border-gray-200 z-[1000] min-w-[280px]'>
        {links.map(({name, href, description, target, isDevelopment}) => (
            <div
                key={name}
                className='relative rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors mb-1 last:mb-0 cursor-pointer'>
                <a
                    href={href}
                    target={target || "_blank"}
                    rel='noopener noreferrer'
                    className='block'>
                    <div className='text-base font-semibold text-gray-800'>
                        {name}{" "}
                        {isDevelopment && (
                            <span className='text-secondary text-sm'>(In Dev)</span>
                        )}
                    </div>
                    <div className='text-sm text-gray-600 mt-0.5'>
                        {description}
                    </div>
                    <span className='absolute inset-0' />
                </a>
            </div>
        ))}
    </div>
);

export default PrepYatraNavbarDropdownContainer;
