import React from "react"
import { Star } from "lucide-react"
import { StarRatingProps } from "@/interfaces"



const StarRating: React.FC<StarRatingProps> = ({
  rating,
  hoverRating,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  return (
    <div className="flex mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onClick(star)}
          onMouseEnter={() => onMouseEnter(star)}
          onMouseLeave={onMouseLeave}
          className="focus:outline-none"
        >
          <Star
            className={`w-4 h-4 ${
              (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default StarRating
