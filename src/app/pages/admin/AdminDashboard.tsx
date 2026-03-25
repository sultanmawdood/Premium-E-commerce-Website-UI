import { motion } from 'motion/react';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Edit,
  LogOut,
  Home,
  Settings,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const stats = [
    { title: 'Total Revenue', value: '$45,231', change: '+12.5%', trend: 'up', icon: DollarSign },
    { title: 'Total Orders', value: '1,234', change: '+8.2%', trend: 'up', icon: ShoppingCart },
    { title: 'Total Customers', value: '8,549', change: '+15.3%', trend: 'up', icon: Users },
    { title: 'Total Products', value: '456', change: '-2.4%', trend: 'down', icon: Package },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'John Doe', product: 'Running Shoes', amount: '$129.99', status: 'Completed', date: '2024-01-15' },
    { id: '#ORD-002', customer: 'Jane Smith', product: 'Yoga Mat', amount: '$49.99', status: 'Processing', date: '2024-01-15' },
    { id: '#ORD-003', customer: 'Mike Johnson', product: 'Sports Bra', amount: '$44.99', status: 'Shipped', date: '2024-01-14' },
    { id: '#ORD-004', customer: 'Sarah Williams', product: 'Training Jacket', amount: '$89.99', status: 'Completed', date: '2024-01-14' },
    { id: '#ORD-005', customer: 'Tom Brown', product: 'Gym Bag', amount: '$69.99', status: 'Processing', date: '2024-01-13' },
    { id: '#ORD-006', customer: 'Emily Davis', product: 'Compression Shirt', amount: '$54.99', status: 'Shipped', date: '2024-01-13' },
    { id: '#ORD-007', customer: 'David Wilson', product: 'Basketball Shoes', amount: '$159.99', status: 'Completed', date: '2024-01-12' },
    { id: '#ORD-008', customer: 'Lisa Anderson', product: 'Leggings', amount: '$59.99', status: 'Processing', date: '2024-01-12' },
  ];

  const topProducts = [
    { name: 'Pro Performance Running Shoes', sales: 234, revenue: '$30,426', stock: 45 },
    { name: 'Women\'s Performance Leggings', sales: 412, revenue: '$24,708', stock: 89 },
    { name: 'Basketball Sneakers Pro', sales: 189, revenue: '$28,311', stock: 23 },
    { name: 'Elite Training Jacket', sales: 156, revenue: '$14,034', stock: 67 },
    { name: 'Premium Gym Bag', sales: 203, revenue: '$14,197', stock: 34 },
  ];

  const recentCustomers = [
    { name: 'Alex Johnson', email: 'alex@example.com', orders: 12, spent: '$1,234', joined: '2023-12-01' },
    { name: 'Maria Garcia', email: 'maria@example.com', orders: 8, spent: '$892', joined: '2023-11-15' },
    { name: 'James Smith', email: 'james@example.com', orders: 15, spent: '$1,567', joined: '2023-10-20' },
    { name: 'Sophie Chen', email: 'sophie@example.com', orders: 6, spent: '$678', joined: '2024-01-05' },
    { name: 'Ryan Miller', email: 'ryan@example.com', orders: 10, spent: '$1,045', joined: '2023-12-10' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-secondary text-secondary-foreground border-r border-border transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-lg">K</span>
              </div>
              <div>
                <div className="font-black text-lg">KINGSPORTS</div>
                <div className="text-xs opacity-70">Admin Panel</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/20'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/20'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                activeTab === 'products' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/20'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Products</span>
            </button>
            <button
              onClick={() => { setActiveTab('customers'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                activeTab === 'customers' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/20'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Customers</span>
            </button>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border space-y-2">
            <Link
              to="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-muted/20 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>View Site</span>
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-muted/20 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-secondary text-secondary-foreground border-b border-border p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-muted/20 rounded"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black">K</span>
              </div>
              <span className="font-black">ADMIN</span>
            </div>
            <div className="w-10" />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-black mb-2">Dashboard</h1>
            <p className="text-muted-foreground mb-8">Welcome back! Here's what's happening with your store.</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-background p-6 rounded-lg border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-primary" />
                <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-black mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </motion.div>
          ))}
          </div>

          {/* Content Tabs */}
          <div className="bg-background rounded-lg border border-border mb-8">
            <div className="border-b border-border">
              <div className="flex gap-4 px-6 overflow-x-auto">
                {['overview', 'orders', 'products', 'customers'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 border-b-2 transition-colors capitalize whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-primary text-primary font-semibold'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Recent Orders */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black">Recent Orders</h2>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-primary hover:underline text-sm font-semibold"
                    >
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                          <th className="text-left py-3 px-4 font-semibold">Customer</th>
                          <th className="text-left py-3 px-4 font-semibold">Product</th>
                          <th className="text-left py-3 px-4 font-semibold">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold">Status</th>
                          <th className="text-left py-3 px-4 font-semibold">Date</th>
                          <th className="text-left py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.slice(0, 5).map((order, idx) => (
                          <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 font-semibold">{order.id}</td>
                            <td className="py-3 px-4">{order.customer}</td>
                            <td className="py-3 px-4">{order.product}</td>
                            <td className="py-3 px-4 font-semibold">{order.amount}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{order.date}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button className="p-1 hover:text-primary transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1 hover:text-primary transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Products */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black">Top Products</h2>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="text-primary hover:underline text-sm font-semibold"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                        </div>
                        <div className="text-right mr-8">
                          <p className="font-bold text-primary">{product.revenue}</p>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{product.stock}</p>
                          <p className="text-sm text-muted-foreground">In Stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black">All Orders</h2>
                  <div className="flex gap-2">
                    <select className="px-4 py-2 border border-border rounded bg-background">
                      <option>All Status</option>
                      <option>Completed</option>
                      <option>Processing</option>
                      <option>Shipped</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Search orders..." 
                      className="px-4 py-2 border border-border rounded bg-background"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold">Product</th>
                        <th className="text-left py-3 px-4 font-semibold">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-semibold">{order.id}</td>
                          <td className="py-3 px-4">{order.customer}</td>
                          <td className="py-3 px-4">{order.product}</td>
                          <td className="py-3 px-4 font-semibold">{order.amount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{order.date}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button className="p-1 hover:text-primary transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 hover:text-primary transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black">Products Management</h2>
                  <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">
                    <Package className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {topProducts.map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.sales} sales • Stock: {product.stock}</p>
                      </div>
                      <div className="text-right mr-8">
                        <p className="font-bold text-primary">{product.revenue}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border border-border rounded hover:bg-muted transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-1 border border-border rounded hover:bg-red-100 hover:text-red-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black">Customers</h2>
                  <input 
                    type="text" 
                    placeholder="Search customers..." 
                    className="px-4 py-2 border border-border rounded bg-background"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Orders</th>
                        <th className="text-left py-3 px-4 font-semibold">Total Spent</th>
                        <th className="text-left py-3 px-4 font-semibold">Joined</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCustomers.map((customer, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-semibold">{customer.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{customer.email}</td>
                          <td className="py-3 px-4">{customer.orders}</td>
                          <td className="py-3 px-4 font-semibold text-primary">{customer.spent}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{customer.joined}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button className="p-1 hover:text-primary transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 hover:text-primary transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
