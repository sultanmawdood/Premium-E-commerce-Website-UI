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
  colors?: string[];
  colorImages?: Record<string, string>;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating = 4.5,
  badge,
  colors = [],
  colorImages = {},
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0] || '');
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const currentImage = selectedColor && colorImages[selectedColor] ? colorImages[selectedColor] : image;

  const colorMap: Record<string, string> = {
    'Black': 'bg-black',
    'White': 'bg-white border-2 border-gray-300',
    'Grey': 'bg-gray-500',
    'Navy': 'bg-blue-900',
    'Red': 'bg-red-500',
    'Blue': 'bg-blue-500',
    'Pink': 'bg-pink-500',
    'Purple': 'bg-purple-500',
    'Green': 'bg-green-500',
    'Brown': 'bg-amber-800',
    'Orange': 'bg-orange-500',
    'Yellow': 'bg-yellow-500',
    'Royal White': 'bg-gradient-to-r from-white to-blue-100 border-2 border-blue-200',
    'White/Gold': 'bg-gradient-to-r from-white to-yellow-100 border-2 border-yellow-200',
    'Classic White': 'bg-white border-2 border-gray-200',
  };

  return (
    <Link
      to={`/product/${id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden bg-muted aspect-square mb-3">
        <img
          src={currentImage}
          alt={`${name} - ${selectedColor || 'Default'}`}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
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

        {/* Color Options */}
        {colors.length > 1 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {colors.slice(0, 3).map((color) => (
              <button
                key={color}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${
                  selectedColor === color
                    ? 'border-white shadow-lg scale-110'
                    : 'border-gray-300 hover:border-white hover:scale-105'
                } ${colorMap[color] || 'bg-gray-400'}`}
                title={color}
              />
            ))}
            {colors.length > 3 && (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                +{colors.length - 3}
              </div>
            )}
          </div>
        )}

        <button
          className={`absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-secondary-foreground flex items-center gap-2 transition-all duration-300 text-xs sm:text-sm ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Quick Add</span>
          <span className="sm:hidden">Add</span>
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

        <h3 className="mb-1 group-hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base font-medium">
          {name}
        </h3>

        {selectedColor && (
          <p className="text-xs text-muted-foreground mb-1">
            Color: {selectedColor}
          </p>
        )}

        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm sm:text-base">${price}</span>
          {originalPrice && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              ${originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
