import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

import { Text } from '@/components';
import type { SelectInputProps } from '@/interfaces';

const SelectInput = ({
  list,
  selectedItem,
  onChange,
  className = '',
}: SelectInputProps) => {
  return (
    <Listbox value={selectedItem} onChange={onChange}>
      <div className={`relative w-32 ${className}`}>
        <Listbox.Button className='flex w-full items-center justify-between rounded-lg border border-grey px-2 py-1 text-sm text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-grey'>
          <Text className='truncate' level='span'>
            {selectedItem || 'Select'}
          </Text>
          <ChevronUpDownIcon className='h-3 w-4 text-grey' />
        </Listbox.Button>

        <Listbox.Options className='absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-grey bg-white shadow-md focus:outline-none'>
          {list.map((item, idx) => (
            <Listbox.Option
              key={idx}
              className={({ active, selected }) =>
                clsx(
                  'cursor-pointer select-none px-2 py-1 text-sm',
                  active && !selected && 'bg-grey/10',
                  selected &&
                    'bg-primary px-2 rounded-md border font-semibold text-white',
                  !selected && 'text-black'
                )
              }
              value={item}
            >
              <Text className='truncate' level='span'>
                {item}
              </Text>
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

export default SelectInput;
