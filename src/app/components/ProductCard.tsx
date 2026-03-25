import { Link } from 'react-router';
import { Star, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  badge?: string;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating = 4.5,
  badge,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Link
      to={`/product/${id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden bg-muted aspect-square mb-3">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {badge && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 text-xs uppercase tracking-wider">
            {badge}
          </div>
        )}

        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs">
            -{discount}%
          </div>
        )}

        <button
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-secondary text-secondary-foreground flex items-center gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Quick Add</span>
        </button>
      </div>

      <div>
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < Math.floor(rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-300 text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({rating})</span>
        </div>

        <h3 className="mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="font-semibold">${price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
