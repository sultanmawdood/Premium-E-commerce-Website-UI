import { Link, useNavigate } from 'react-router';
import { Search, ShoppingCart, User, Menu, Moon, Sun, X, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const { totalItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  // Search products function
  const searchProducts = async (query) => {
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
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchProducts(query);
  };

  // Handle search result click
  const handleResultClick = (productId) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    // Navigate to product detail or products page with search
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
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
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.relative')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e) => {
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
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black">K</span>
              </div>
              <span className="font-black tracking-tight">KINGSPORTS</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/shop/men" className="hover:text-primary transition-colors">
                Men
              </Link>
              <Link to="/shop/women" className="hover:text-primary transition-colors">
                Women
              </Link>
              <Link to="/shop/shoes" className="hover:text-primary transition-colors">
                Shoes
              </Link>
              <Link to="/shop/accessories" className="hover:text-primary transition-colors">
                Accessories
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Search</span>
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
                                  e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
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
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            <div className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-muted transition-colors rounded-lg"
                  >
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
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
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg"
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
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link to="/shop/men" className="hover:text-primary transition-colors">
                Men
              </Link>
              <Link to="/shop/women" className="hover:text-primary transition-colors">
                Women
              </Link>
              <Link to="/shop/shoes" className="hover:text-primary transition-colors">
                Shoes
              </Link>
              <Link to="/shop/accessories" className="hover:text-primary transition-colors">
                Accessories
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
