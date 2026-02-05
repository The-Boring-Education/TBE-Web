import type { LearningSidebarListProps } from '@tbe/interface';

const LearningSidebarList = <T,>({
  items,
  renderItem,
  getKey,
  className = '',
}: LearningSidebarListProps<T>) => {
  return (
    <div className={`flex flex-col gap-px ${className}`}>
      {items.map((item, index) => (
        <div key={getKey ? getKey(item, index) : index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

export default LearningSidebarList;