import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const Products = () => {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    brand: 'all',
    search: urlSearch
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    brands: [],
    priceRange: { minPrice: 0, maxPrice: 1000 }
  });

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5003/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setFilteredProducts(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/products/filters/options');
      const data = await response.json();
      
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...products];

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filter by brand
    if (filters.brand !== 'all') {
      filtered = filtered.filter(product => 
        product.brand.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    // Filter by search term
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: 'all',
      brand: 'all',
      search: ''
    });
  };

  // Seed database (for development)
  const seedDatabase = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/seed', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully seeded ${data.count} products!`);
        fetchProducts();
      } else {
        alert('Failed to seed database');
      }
    } catch (err) {
      alert('Error seeding database: ' + err.message);
    }
  };

  // Effects
  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, []);

  // Update search when URL changes
  useEffect(() => {
    const newUrlSearch = searchParams.get('search') || '';
    if (newUrlSearch !== filters.search) {
      setFilters(prev => ({ ...prev, search: newUrlSearch }));
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={fetchProducts}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={seedDatabase}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Seed Database
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">KingSports Products</h1>
          <p className="text-gray-600 mt-2">Discover our premium sports collection</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {filterOptions.categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Brands</option>
                {filterOptions.brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
            <button 
              onClick={resetFilters}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Product Image */}
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Brand & Category */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      {product.brand}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {product.category}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center mb-3">
                      <span className="text-xs text-gray-500 mr-2">Colors:</span>
                      <div className="flex space-x-1">
                        {product.colors.slice(0, 3).map((color, index) => (
                          <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {color}
                          </span>
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs text-gray-400">+{product.colors.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price & Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.rating > 0 && (
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="text-right">
                      {product.stock > 0 ? (
                        <span className="text-xs text-green-600 font-medium">
                          In Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    className={`w-full mt-4 py-2 px-4 rounded-md font-medium transition-colors ${
                      product.stock > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;