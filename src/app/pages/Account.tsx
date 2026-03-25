import { useState } from 'react';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

export function Account() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const orders = [
    {
      id: 'ORD-001',
      date: 'March 20, 2026',
      status: 'Delivered',
      total: 249.99,
      items: 3,
    },
    {
      id: 'ORD-002',
      date: 'March 15, 2026',
      status: 'In Transit',
      total: 129.99,
      items: 1,
    },
    {
      id: 'ORD-003',
      date: 'March 10, 2026',
      status: 'Delivered',
      total: 89.99,
      items: 2,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">My Account</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeTab === 'orders'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeTab === 'wishlist'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-black mb-6">Profile Information</h2>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">First Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name?.split(' ')[0] || ''}
                      className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Last Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name?.split(' ').slice(1).join(' ') || ''}
                      className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Phone</label>
                  <input
                    type="tel"
                    defaultValue={user?.phone || ''}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-black mb-6">Order History</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black mb-1">Order {order.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on {order.date}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 text-sm ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {order.status}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.items} items • ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <button className="text-primary hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-2xl font-black mb-6">Wishlist</h2>
              <p className="text-muted-foreground">
                Your wishlist is empty. Start adding items you love!
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-black mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button className="bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="mb-4">Email Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Receive promotional emails</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Receive order updates</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>Receive newsletter</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
