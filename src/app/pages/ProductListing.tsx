import { useParams } from 'react-router';
import { useState, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { getProductsByCategory, products, Product } from '../data/products';
import { SlidersHorizontal, X, TrendingUp, Award, Truck, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export function ProductListing() {
  const { category } = useParams<{ category: string }>();
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');

  const categoryProducts = category ? getProductsByCategory(category) : products;

  const filteredProducts = useMemo(() => {
    let filtered = [...categoryProducts];

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      );
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) =>
        p.brand && selectedBrands.includes(p.brand)
      );
    }

    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors?.some((c) => selectedColors.includes(c))
      );
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [categoryProducts, priceRange, selectedSizes, selectedBrands, selectedColors, sortBy]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '7', '8', '9', '10', '11', '12'];
  const allBrands = ['KingSports', 'ProAthlete', 'EliteGear', 'SportMax'];
  const allColors = ['Black', 'White', 'Grey', 'Navy', 'Red', 'Blue', 'Pink', 'Purple', 'Green'];

  // Get available colors from current products with counts
  const availableColors = useMemo(() => {
    const colorCounts = new Map<string, number>();
    categoryProducts.forEach(product => {
      product.colors?.forEach(color => {
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      });
    });
    return allColors.filter(color => colorCounts.has(color)).map(color => ({
      name: color,
      count: colorCounts.get(color) || 0
    }));
  }, [categoryProducts]);

  const getCategoryTitle = () => {
    if (!category) return 'All Products';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getCategoryDescription = () => {
    const descriptions: Record<string, string> = {
      men: 'Discover premium athletic wear designed for peak performance. From training gear to casual sportswear.',
      women: 'Elevate your workout with our collection of high-performance women\'s athletic apparel.',
      shoes: 'Step up your game with our cutting-edge footwear technology for every sport and activity.',
      accessories: 'Complete your athletic look with essential accessories designed for champions.',
    };
    return category ? descriptions[category] || 'Browse our complete collection' : 'Browse our complete collection';
  };

  return (
    <div className="min-h-screen">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-secondary text-secondary-foreground py-8 sm:py-12 lg:py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="text-primary uppercase tracking-wider text-xs sm:text-sm">Shop Collection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase mb-4">
            {getCategoryTitle()}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl opacity-90 max-w-2xl">
            {getCategoryDescription()}
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-muted py-4 sm:py-6 lg:py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { icon: Award, title: 'Premium Quality', desc: 'Guaranteed' },
              { icon: TrendingUp, title: 'Best Sellers', desc: 'Top rated items' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 sm:gap-3">
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs sm:text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="bg-primary/10 border-l-4 border-primary p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <p className="font-semibold text-sm sm:text-base">Showing {filteredProducts.length} of {categoryProducts.length} products</p>
              {(selectedSizes.length > 0 || selectedBrands.length > 0 || selectedColors.length > 0 || priceRange[1] < 200) && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Filters applied</p>
              )}
            </div>
            {(selectedSizes.length > 0 || selectedBrands.length > 0 || selectedColors.length > 0 || priceRange[1] < 200) && (
              <button
                onClick={() => {
                  setSelectedSizes([]);
                  setSelectedBrands([]);
                  setSelectedColors([]);
                  setPriceRange([0, 200]);
                }}
                className="text-xs sm:text-sm text-primary hover:underline font-semibold whitespace-nowrap"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-muted transition-colors lg:hidden w-full sm:w-auto justify-center"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <label className="text-xs sm:text-sm whitespace-nowrap">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 lg:gap-8">
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 flex-shrink-0`}
          >
            <div className="sticky top-20 space-y-4 sm:space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm sm:text-base">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h4 className="mb-3 text-sm sm:text-base font-medium">Price Range</h4>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], parseInt(e.target.value)])
                        }
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm sm:text-base font-medium">Size</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {allSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`px-2 sm:px-3 py-1 border transition-colors text-xs sm:text-sm ${
                            selectedSizes.includes(size)
                              ? 'bg-secondary text-secondary-foreground border-secondary'
                              : 'border-border hover:border-foreground'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm sm:text-base font-medium">Brand</h4>
                    <div className="space-y-2">
                      {allBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors text-xs sm:text-sm">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-3 h-3 sm:w-4 sm:h-4"
                          />
                          <span>{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm sm:text-base font-medium">Color</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {availableColors.map((colorInfo) => {
                        const color = colorInfo.name;
                        const count = colorInfo.count;
                        const colorMap: Record<string, string> = {
                          'Black': 'bg-black',
                          'White': 'bg-white border-2 border-gray-300',
                          'Grey': 'bg-gray-500',
                          'Navy': 'bg-blue-900',
                          'Red': 'bg-red-500',
                          'Blue': 'bg-blue-500',
                          'Pink': 'bg-pink-500',
                          'Purple': 'bg-purple-500',
                          'Green': 'bg-green-500'
                        };
                        
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleColor(color);
                            }}
                            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border transition-all text-xs sm:text-sm rounded-md cursor-pointer ${
                              selectedColors.includes(color)
                                ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                                : 'border-border hover:border-foreground hover:shadow-sm'
                            }`}
                          >
                            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${colorMap[color] || 'bg-gray-400'} ${color === 'White' ? 'border border-gray-400' : ''}`}></div>
                            <span className="hidden sm:inline">{color}</span>
                            <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {filteredProducts.length > 0 && (
              <div className="mb-6 p-4 bg-muted">
                <h3 className="font-bold mb-2">💡 Shopping Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Free shipping on orders over $100</li>
                  <li>• 30-day easy returns on all items</li>
                  <li>• Check our size guide for the perfect fit</li>
                </ul>
              </div>
            )}

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  {...product} 
                  colors={product.colors}
                  colorImages={product.colorImages}
                />
              ))}
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">No Products Found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any products matching your filters. Try adjusting your search criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSizes([]);
                      setSelectedBrands([]);
                      setSelectedColors([]);
                      setPriceRange([0, 200]);
                    }}
                    className="bg-primary text-primary-foreground px-6 py-3 hover:bg-primary/90 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-muted py-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black mb-2">Why Shop With Us?</h2>
              <p className="text-muted-foreground">Experience the KingSports difference</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Every product is crafted with the finest materials and cutting-edge technology for maximum performance.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Satisfaction Guaranteed</h3>
                <p className="text-sm text-muted-foreground">
                  Not happy with your purchase? We offer hassle-free returns within 30 days, no questions asked.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Fast & Free Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Get your gear delivered fast with free shipping on all orders over $100. Track your order every step.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
