import type { TestimonialCardProps } from "@tbe/interface";
import { Quote, Star } from "lucide-react";

const TestimonialCard = ({
  image,
  imageAltText,
  title,
  content,
  work,
}: TestimonialCardProps) => (
  <div className="flex h-full flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-[#FF5757]/40 hover:shadow-md select-none dark:border-zinc-700 dark:bg-zinc-900/90">
    <div>
      {/* Star Rating & Quote Accent */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-3.5 w-3.5 fill-[#FF5757] text-[#FF5757]"
            />
          ))}
        </div>
        <Quote className="h-4 w-4 text-[#FF5757]/40" />
      </div>

      {/* Testimonial Content */}
      <p className="text-xs sm:text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-300">
        "{content}"
      </p>
    </div>

    {/* Learner Info Footer */}
    <div className="mt-4 flex items-center gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <img
        alt={imageAltText}
        className="h-10 w-10 rounded-full border-2 border-[#FF5757]/20 object-cover"
        src={`${image}`}
      />
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-extrabold text-zinc-900 truncate dark:text-zinc-100">
          {title}
        </h4>
        <p className="text-[10px] font-bold text-[#FF5757] truncate">{work}</p>
      </div>
    </div>
  </div>
);

export default TestimonialCard;
