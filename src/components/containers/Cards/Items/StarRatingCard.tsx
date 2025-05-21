import React from "react"
import { FaStar } from "react-icons/fa" 
import { StarRatingCardProps } from "@/interfaces"

const StarRatingCard= ({
  rating,
  hoverRating,
  onMouseEnter,
  onMouseLeave,
  onClick,
}:StarRatingCardProps) => {
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
          <FaStar
            className={`w-4 h-4 ${
              (hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default StarRatingCard
