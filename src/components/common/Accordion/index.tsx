import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

import { FlexContainer, Text } from '@/components';
import type { AccordionProps } from '@/interfaces';

const Accordion = ({ title, children, open = false }: AccordionProps) => {
  const [isSelected, setIsSelected] = useState(open);

  return (
    <Disclosure defaultOpen={open}>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={`flex w-full justify-between items-center rounded border px-2 py-1 strong-text hover:bg-gray-200 ${
              isSelected ? 'bg-blue-100' : ''
            }`}
            onClick={() => setIsSelected(!isSelected)}
          >
            <Text className='paragraph text-greyDark text-left' level='span'>
              {title}
            </Text>
            <ChevronUpIcon
              className={`transition text-greyDark ${
                !open ? 'rotate-180 transform' : ''
              } h-5 w-5`}
            />
          </Disclosure.Button>
          <FlexContainer className='my-1 w-full' justifyCenter={false}>
            {children}
          </FlexContainer>
        </>
      )}
    </Disclosure>
  );
};

export default Accordion;
