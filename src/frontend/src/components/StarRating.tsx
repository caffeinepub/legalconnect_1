import { Star } from "lucide-react";

export function StarRating({
  rating,
  max = 5,
  size = 16,
}: { rating: number; max?: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          // biome-ignore lint/suspicious/noArrayIndexKey: star rating positional
          key={`star-${i}`}
          size={size}
          className={
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}
