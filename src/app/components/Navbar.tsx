import { Link, useNavigate, useLocation } from 'react-router';
import { Search, ShoppingCart, User, Menu, Moon, Sun, X, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const { totalItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  // Search products function
  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5003/api/products?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data.slice(0, 5)); // Show max 5 results
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchProducts(query);
  };

  // Handle search result click
  const handleResultClick = (productId: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    // Navigate to product detail or products page with search
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (userMenuOpen && target && !target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
      // Close mobile menu when clicking outside
      if (mobileMenuOpen && target && !target.closest('nav')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen, mobileMenuOpen]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    if (searchOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [searchOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border backdrop-blur-sm bg-background/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center">
              <img 
                src="/src/assets/Logo.png.png" 
                alt="KingSports Logo" 
                className="h-12 sm:h-14 lg:h-16 w-auto object-contain"
                onError={(e) => {
                  // Fallback to a default logo if image fails to load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              {/* Fallback logo */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary flex items-center justify-center rounded-lg" style={{display: 'none'}}>
                <span className="text-primary-foreground font-black text-xl sm:text-2xl lg:text-3xl">K</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8 ml-12">
              {/* Men Dropdown */}
              <div className="relative dropdown-container group">
                <button
                  className="flex items-center gap-1 hover:text-primary transition-colors py-4 font-medium whitespace-nowrap"
                >
                  Men
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 mt-0 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-3">
                    <Link to="/shop/men" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-gray-100">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      All Men's
                    </Link>
                    <Link to="/shop/men?type=shirts" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      T-Shirts & Jerseys
                    </Link>
                    <Link to="/shop/men?type=training" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Training Wear
                    </Link>
                    <Link to="/shop/men?type=jackets" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Jackets & Hoodies
                    </Link>
                    <Link to="/shop/men?type=shorts" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Shorts & Pants
                    </Link>
                  </div>
                </div>
              </div>

              {/* Women Dropdown */}
              <div className="relative dropdown-container group">
                <button
                  className="flex items-center gap-1 hover:text-primary transition-colors py-4 font-medium whitespace-nowrap"
                >
                  Women
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 mt-0 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-3">
                    <Link to="/shop/women" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-gray-100">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      All Women's
                    </Link>
                    <Link to="/shop/women?type=activewear" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Activewear
                    </Link>
                    <Link to="/shop/women?type=leggings" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Leggings & Yoga
                    </Link>
                    <Link to="/shop/women?type=tops" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Sports Bras & Tops
                    </Link>
                    <Link to="/shop/women?type=jackets" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Jackets & Outerwear
                    </Link>
                  </div>
                </div>
              </div>

              {/* Shoes Dropdown */}
              <div className="relative dropdown-container group">
                <button
                  className="flex items-center gap-1 hover:text-primary transition-colors py-4 font-medium whitespace-nowrap"
                >
                  Shoes
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 mt-0 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-3">
                    <Link to="/shop/shoes" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-gray-100">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      All Shoes
                    </Link>
                    <Link to="/shop/shoes?type=football" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Football Boots
                    </Link>
                    <Link to="/shop/shoes?type=running" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Running Shoes
                    </Link>
                    <Link to="/shop/shoes?type=basketball" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Basketball Shoes
                    </Link>
                    <Link to="/shop/shoes?type=training" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Training Shoes
                    </Link>
                  </div>
                </div>
              </div>

              <Link to="/shop/accessories" className="hover:text-primary transition-colors font-medium py-4">
                Accessories
              </Link>

              {/* Sport Collection Dropdown */}
              <div className="relative dropdown-container group">
                <button
                  className="flex items-center gap-1 hover:text-primary transition-colors py-4 font-medium whitespace-nowrap"
                >
                  Sports
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 mt-0 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-3">
                    <Link to="/shop/sport-collection" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-gray-100">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      All Sports
                    </Link>
                    <Link to="/shop/sport-collection?sport=football" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Football
                    </Link>
                    <Link to="/shop/sport-collection?sport=basketball" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Basketball
                    </Link>
                    <Link to="/shop/sport-collection?sport=running" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Running
                    </Link>
                    <Link to="/shop/sport-collection?sport=training" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Training
                    </Link>
                  </div>
                </div>
              </div>

              {/* Ball Collection Dropdown */}
              <div className="relative dropdown-container group">
                <button
                  className="flex items-center gap-1 hover:text-primary transition-colors py-4 font-medium whitespace-nowrap"
                >
                  Balls
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 mt-0 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-3">
                    <Link to="/shop/ball-collection" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-gray-100">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      All Balls
                    </Link>
                    <Link to="/shop/ball-collection?type=football" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Football
                    </Link>
                    <Link to="/shop/ball-collection?type=basketball" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Basketball
                    </Link>
                    <Link to="/shop/ball-collection?type=volleyball" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Volleyball
                    </Link>
                    <Link to="/shop/ball-collection?type=tennis" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Tennis Balls
                    </Link>
                    <Link to="/shop/ball-collection?type=rugby" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Rugby
                    </Link>
                  </div>
                </div>
              </div>

              <Link to="/contact" className="hover:text-primary transition-colors font-medium py-4 mr-8">
                Contact
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            {/* Search */}
            <div className="relative">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-muted hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Search</span>
              </button>
              
              {/* Mobile Search Button */}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="sm:hidden p-2 hover:bg-muted transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Overlay */}
              {searchOpen && (
                <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSearchOpen(false)}>
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-auto px-4">
                    <div className="bg-background border border-border shadow-lg p-4">
                      {/* Search Input */}
                      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-3 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setSearchOpen(false)}
                          className="p-3 hover:bg-muted transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>

                      {/* Search Results */}
                      {loading && (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Products</h3>
                          {searchResults.map((product) => (
                            <div
                              key={product._id}
                              onClick={() => handleResultClick(product._id)}
                              className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors"
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                                }}
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{product.name}</h4>
                                <p className="text-xs text-muted-foreground">{product.brand}</p>
                                <p className="text-sm font-semibold">${product.price.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                          {searchQuery && (
                            <button
                              onClick={handleSearchSubmit}
                              className="w-full text-left p-3 hover:bg-muted transition-colors text-sm text-primary"
                            >
                              View all results for "{searchQuery}"
                            </button>
                          )}
                        </div>
                      )}

                      {searchQuery && !loading && searchResults.length === 0 && (
                        <div className="text-center py-8">
                          <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No products found for "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* User Menu */}
            <div className="relative user-menu">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 sm:gap-2 p-2 hover:bg-muted transition-colors rounded-lg"
                  >
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-bold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>My Account</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg text-sm"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">Login</span>
                </Link>
              )}
            </div>

            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 hover:bg-muted transition-colors"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-3 sm:gap-4">
              <Link 
                to="/shop/men" 
                className="hover:text-primary transition-colors text-sm sm:text-base py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Men
              </Link>
              <Link 
                to="/shop/women" 
                className="hover:text-primary transition-colors text-sm sm:text-base py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Women
              </Link>
              <Link 
                to="/shop/shoes" 
                className="hover:text-primary transition-colors text-sm sm:text-base py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shoes
              </Link>
              <Link 
                to="/shop/accessories" 
                className="hover:text-primary transition-colors text-sm sm:text-base py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accessories
              </Link>
              <Link 
                to="/shop/sport-collection" 
                className="hover:text-primary transition-colors text-sm sm:text-base py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sports
              </Link>
              <Link 
                to="/shop/ball-collection" 
                className="hover:text-primary transition-colors text-sm sm:text-base py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Balls
              </Link>
              <Link 
                to="/contact" 
                className="hover:text-primary transition-colors text-sm sm:text-base py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
