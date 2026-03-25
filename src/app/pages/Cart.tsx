import { Link, useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, Truck, Shield, Tag, Gift, ArrowRight, Heart } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

export function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  const handleApplyPromo = () => {
    const validCodes: Record<string, number> = {
      'SAVE10': 10,
      'WELCOME20': 20,
      'FREESHIP': 0,
    };

    if (validCodes[promoCode.toUpperCase()]) {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount: validCodes[promoCode.toUpperCase()] });
      setPromoCode('');
    } else {
      alert('Invalid promo code');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  if (items.length === 0) {
    return (
      <div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-secondary text-secondary-foreground py-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-black">Shopping Cart</h1>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-black mb-4">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet. Start shopping to find your perfect gear!
            </p>
            <Link
              to="/shop/men"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-all hover:gap-4"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const shipping = appliedPromo?.code === 'FREESHIP' || totalPrice > 100 ? 0 : 10;
  const tax = totalPrice * 0.08;
  const discount = appliedPromo ? (totalPrice * appliedPromo.discount) / 100 : 0;
  const total = totalPrice + shipping + tax - discount;

  return (
    <div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-secondary text-secondary-foreground py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2">Shopping Cart</h1>
          <p className="text-lg opacity-90">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-muted py-4"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <span><strong>Free Shipping</strong> on orders over $100</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span><strong>Secure Checkout</strong> - Your data is protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <span><strong>Free Returns</strong> within 30 days</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {totalPrice < 100 && totalPrice > 0 && (
          <div className="mb-6 bg-primary/10 border-l-4 border-primary p-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <p className="font-semibold">
                Add ${(100 - totalPrice).toFixed(2)} more to get <strong>FREE SHIPPING</strong>!
              </p>
            </div>
            <div className="mt-2 bg-background/50 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300" 
                style={{ width: `${Math.min((totalPrice / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 space-y-4"
          >
            {items.map((item, idx) => (
              <div
                key={`${item.id}-${item.size}-${item.color}-${idx}`}
                className="flex gap-4 border border-border p-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover bg-muted"
                />

                <div className="flex-1">
                  <Link to={`/product/${item.id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-bold mb-1">{item.name}</h3>
                  </Link>
                  <div className="text-sm text-muted-foreground mb-2">
                    Size: {item.size} | Color: {item.color}
                  </div>
                  <div className="text-sm font-semibold text-primary mb-2">
                    ${item.price.toFixed(2)} each
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.size,
                            item.color,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 border border-border hover:bg-muted transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.size,
                            item.color,
                            item.quantity + 1
                          )
                        }
                        className="w-8 h-8 border border-border hover:bg-muted transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeFromCart(item.id, item.size, item.color)}
                    className="p-2 hover:text-destructive transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 hover:text-primary transition-colors"
                    title="Save for later"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="border border-border p-6 sticky top-20 space-y-6">
              <div>
                <h2 className="text-xl font-black mb-4">Promo Code</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <div className="mt-2 flex items-center justify-between bg-primary/10 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{appliedPromo.code}</span>
                    </div>
                    <button onClick={removePromo} className="text-destructive hover:underline">
                      Remove
                    </button>
                  </div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Try: SAVE10, WELCOME20, FREESHIP
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-black mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.length} items)</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  {appliedPromo && appliedPromo.discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Discount ({appliedPromo.discount}%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black">Total</span>
                    <span className="text-2xl font-black text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-colors mb-3 font-semibold flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <Link
                  to="/"
                  className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </Link>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-4 h-4" />
                    <span>Estimated delivery: 3-5 business days</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
