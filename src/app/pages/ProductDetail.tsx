import { useParams, Link } from 'react-router';
import { useState } from 'react';
import { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, Heart, Truck, Shield, RotateCcw } from 'lucide-react';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProductById(id) : undefined;
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl mb-4">Product not found</h1>
        <Link to="/" className="text-primary hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  const images = product.images || [product.image];

  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) {
      alert('Please select a size');
      return;
    }
    if (product.colors && !selectedColor) {
      alert('Please select a color');
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize || 'One Size',
        color: selectedColor || 'Default',
      });
    }

    alert('Added to cart!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="mb-4 aspect-square bg-muted overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square bg-muted overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.badge && (
            <div className="inline-block bg-primary text-primary-foreground px-3 py-1 text-xs uppercase tracking-wider mb-4">
              {product.badge}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-black mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-300 text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-black">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xl text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <p className="text-muted-foreground mb-6">{product.description}</p>

          {product.colors && (
            <div className="mb-6">
              <h3 className="mb-3">Color</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border transition-colors ${
                      selectedColor === color
                        ? 'bg-secondary text-secondary-foreground border-secondary'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes && (
            <div className="mb-6">
              <h3 className="mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border transition-colors ${
                      selectedSize === size
                        ? 'bg-secondary text-secondary-foreground border-secondary'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-border hover:bg-muted transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-border hover:bg-muted transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
            <button className="w-14 h-14 border border-border hover:bg-muted transition-colors flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">30-day return policy</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">2-year warranty included</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-12">
        <h2 className="text-2xl font-black mb-6">Customer Reviews</h2>

        <div className="space-y-6">
          {[
            {
              name: 'John D.',
              rating: 5,
              date: 'March 15, 2026',
              comment: 'Absolutely love these! Great quality and perfect fit.',
            },
            {
              name: 'Sarah M.',
              rating: 4,
              date: 'March 10, 2026',
              comment: 'Very comfortable and stylish. Slightly runs large.',
            },
            {
              name: 'Mike T.',
              rating: 5,
              date: 'March 5, 2026',
              comment: 'Best purchase I\'ve made this year. Highly recommend!',
            },
          ].map((review, idx) => (
            <div key={idx} className="border-b border-border pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-300 text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{review.date}</span>
              </div>
              <h4 className="mb-2">{review.name}</h4>
              <p className="text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
