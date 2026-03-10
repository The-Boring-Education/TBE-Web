import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAudienceBadgeColor(type: string) {
  switch (type) {
    case "tech":
      return "bg-blue-100 text-blue-800";
    case "students":
      return "bg-green-100 text-green-800";
    case "professionals":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
