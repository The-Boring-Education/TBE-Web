interface SectionHeaderProps {
  badge: string;
  heading: string;
  subheading: string;
  className?: string;
}

export default function SectionHeader({
  badge,
  heading,
  subheading,
  className = "mb-12",
}: SectionHeaderProps) {
  return (
    <div className={`text-center max-w-3xl mx-auto ${className}`}>
      <span className="text-[#EA4544] font-bold text-xs tracking-widest uppercase">
        {badge}
      </span>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
        {heading}
      </h2>
      <p className="text-sm sm:text-base text-gray-500 mt-2.5">{subheading}</p>
    </div>
  );
}
