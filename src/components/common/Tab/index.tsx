import { Tab } from '@headlessui/react';

import type { TabProps } from '@/interfaces';

const TabComponent = ({ tabLabels, tabPanels }: TabProps) => (
    <Tab.Group className='w-full'>
      <Tab.List className='flex justify-center flex-wrap gap-2'>
        {tabLabels.map((tab, index) => (
          <Tab
            key={index}
            className={({ selected }) =>
              `md:px-4 md:py-2 px-2 py-1 text-lg font-medium rounded-lg transition-colors ${
                selected ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
              } hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-primary`
            }
          >
            {tab}
          </Tab>
        ))}
      </Tab.List>

      <div className='bg-card mt-4 md:mt-8 rounded-xl shadow-sm max-w-4xl mx-auto'>
        <Tab.Panels>
          {tabPanels.map((panelContent, index) => (
            <Tab.Panel key={index} className='mt-0'>
              {panelContent}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </div>
    </Tab.Group>
  );

export default TabComponent;
