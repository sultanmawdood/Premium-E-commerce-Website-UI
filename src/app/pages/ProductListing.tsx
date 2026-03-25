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
        className="bg-secondary text-secondary-foreground py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-primary uppercase tracking-wider text-sm">Shop Collection</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase mb-4">
            {getCategoryTitle()}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            {getCategoryDescription()}
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-muted py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { icon: Award, title: 'Premium Quality', desc: 'Guaranteed' },
              { icon: TrendingUp, title: 'Best Sellers', desc: 'Top rated items' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <feature.icon className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <div className="font-bold text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-primary/10 border-l-4 border-primary p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Showing {filteredProducts.length} of {categoryProducts.length} products</p>
              {(selectedSizes.length > 0 || selectedBrands.length > 0 || selectedColors.length > 0 || priceRange[1] < 200) && (
                <p className="text-sm text-muted-foreground mt-1">Filters applied</p>
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
                className="text-sm text-primary hover:underline font-semibold"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-muted transition-colors md:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <label className="text-sm">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } md:block w-full md:w-64 flex-shrink-0`}
          >
            <div className="sticky top-20 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="md:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3">Price Range</h4>
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
                      <div className="flex items-center justify-between text-sm">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3">Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {allSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`px-3 py-1 border transition-colors ${
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
                    <h4 className="mb-3">Brand</h4>
                    <div className="space-y-2">
                      {allBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4"
                          />
                          <span>{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3">Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {allColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={`px-3 py-1 border transition-colors text-sm ${
                            selectedColors.includes(color)
                              ? 'bg-secondary text-secondary-foreground border-secondary'
                              : 'border-border hover:border-foreground'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
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
