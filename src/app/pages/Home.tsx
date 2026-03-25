import { Link } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { getFeaturedProducts, getBestSellers } from '../data/products';
import { ArrowRight, TrendingUp, Zap, Shield, Truck, RefreshCw, Award, Star, Instagram, Linkedin, Twitter } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

export function Home() {
  const featuredProducts = getFeaturedProducts(4);
  const bestSellers = getBestSellers(4);
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thanks for subscribing!');
    setEmail('');
  };

  const Counter = ({ end, suffix = '', duration = 3 }: { end: number; suffix?: string; duration?: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.5 });

    useEffect(() => {
      if (isInView) {
        setCount(0);
        const increment = end / (duration * 60);
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, 1000 / 60);
        return () => clearInterval(timer);
      } else {
        setCount(0);
      }
    }, [isInView, end, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
  };

  return (
    <div>
      <section className="relative h-[400px] sm:h-[500px] lg:h-[600px] bg-secondary text-secondary-foreground overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=1600&h=900&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-center sm:text-left"
          >
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="text-primary uppercase tracking-wider text-xs sm:text-sm">New Collection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
              UNLEASH YOUR
              <br />
              <span className="text-primary">POTENTIAL</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 px-4 sm:px-0">
              Premium athletic gear designed for champions. Elevate your performance with KingSports.
            </p>
            <Link
              to="/shop/men"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 hover:bg-primary/90 transition-all hover:gap-4 text-sm sm:text-base"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {[
              { name: 'Men', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=500&fit=crop', category: 'men' },
              { name: 'Women', image: 'https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=400&h=500&fit=crop', category: 'women' },
              { name: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop', category: 'shoes' },
              { name: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', category: 'accessories' },
            ].map((cat) => (
              <Link
                key={cat.category}
                to={`/shop/${cat.category}`}
                className="group relative h-48 sm:h-64 lg:h-80 overflow-hidden rounded-lg"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-end p-3 sm:p-4 lg:p-6">
                  <h3 className="text-white font-black tracking-wide text-sm sm:text-base lg:text-lg">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2">Featured Products</h2>
              <p className="text-muted-foreground text-sm sm:text-base">Handpicked items for peak performance</p>
            </div>
            <Link to="/shop/men" className="flex items-center gap-2 hover:text-primary transition-colors text-sm sm:text-base">
              <span>View All</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} colors={product.colors} colorImages={product.colorImages} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-primary uppercase tracking-wider text-xs sm:text-sm">Top Rated</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black">Best Sellers</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} {...product} colors={product.colors} colorImages={product.colorImages} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                SPRING SALE
                <br />
                UP TO 40% OFF
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Limited time offer on selected items. Don't miss out on these incredible deals!
              </p>
              <Link
                to="/shop/men"
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 hover:bg-secondary/90 transition-all"
              >
                <span>Shop Sale</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative h-80">
              <img
                src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop"
                alt="Sale"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: Award, title: 'Premium Quality', desc: 'Guaranteed excellence' },
            ].map((feature, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center"
              >
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">Our Story</h2>
              <p className="text-lg mb-4 text-muted-foreground">
                Founded in 2020, KingSports was born from a passion for athletic excellence and a commitment to quality. We believe everyone deserves access to premium sportswear that performs as hard as they do.
              </p>
              <p className="text-lg mb-6 text-muted-foreground">
                From professional athletes to weekend warriors, our products are designed to help you reach your peak performance. Every piece is crafted with cutting-edge materials and innovative design.
              </p>
              <Link to="/shop/men" className="inline-flex items-center gap-2 text-primary hover:gap-4 transition-all font-semibold">
                <span>Explore Our Collection</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop" alt="Athletes" className="w-full h-64 object-cover" />
              <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop" alt="Training" className="w-full h-64 object-cover mt-8" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: 50, suffix: 'K+', label: 'Happy Customers' },
              { number: 500, suffix: '+', label: 'Products' },
              { number: 4.8, suffix: '', label: 'Average Rating', isDecimal: true },
              { number: 100, suffix: '%', label: 'Satisfaction' },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="text-5xl font-black mb-2 text-primary">
                  {stat.isDecimal ? (
                    <Counter end={stat.number} suffix={stat.suffix} duration={3} />
                  ) : (
                    <><Counter end={stat.number} suffix="" duration={3} />{stat.suffix}</>
                  )}
                </div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground">Passionate experts dedicated to your athletic success</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: 'Alex Johnson', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop' },
              { name: 'Sarah Martinez', role: 'Head of Design', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop' },
              { name: 'Michael Chen', role: 'Product Manager', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
              { name: 'Emily Davis', role: 'Customer Success', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop' },
            ].map((member, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group"
              >
                <div className="relative overflow-hidden mb-4">
                  <img src={member.image} alt={member.name} className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a href="#" className="w-10 h-10 bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-muted-foreground text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground">Real reviews from real athletes</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {[
              { name: 'Sarah Johnson', role: 'Marathon Runner', text: 'The running shoes are incredible! Best purchase I\'ve made this year. The cushioning is perfect for long distances.', rating: 5 },
              { name: 'Mike Chen', role: 'Gym Enthusiast', text: 'Quality is outstanding and the fit is perfect. I\'ve recommended KingSports to all my workout buddies.', rating: 5 },
              { name: 'Emma Davis', role: 'Yoga Instructor', text: 'The leggings are so comfortable and durable. I wear them for teaching and they still look brand new after months.', rating: 5 },
            ].map((review, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7, delay: idx * 0.2 }}
                className="bg-muted p-6 rounded-lg"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground italic">"{review.text}"</p>
                <div>
                  <div className="font-bold">{review.name}</div>
                  <div className="text-sm text-muted-foreground">{review.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'James Rodriguez', role: 'CrossFit Athlete', text: 'The compression shirts are game-changers! They provide excellent support during intense workouts and the quality is top-notch.', rating: 5 },
              { name: 'Lisa Thompson', role: 'Personal Trainer', text: 'I recommend KingSports to all my clients. The sports bras offer amazing support and the materials are breathable and long-lasting.', rating: 5 },
              { name: 'David Park', role: 'Basketball Player', text: 'These basketball shoes have incredible grip and ankle support. I\'ve noticed a real difference in my performance on the court.', rating: 5 },
            ].map((review, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7, delay: idx * 0.2 }}
                className="bg-muted p-6 rounded-lg"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground italic">"{review.text}"</p>
                <div>
                  <div className="font-bold">{review.name}</div>
                  <div className="text-sm text-muted-foreground">{review.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Instagram className="w-6 h-6 text-primary" />
              <span className="text-primary uppercase tracking-wider text-sm">Follow Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-2">@KingSports</h2>
            <p className="text-muted-foreground">Join our community and share your journey</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
              'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
              'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
              'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=400&fit=crop',
            ].map((img, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="aspect-square overflow-hidden group cursor-pointer"
              >
                <img src={img} alt={`Instagram ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Join the KingSports Family</h2>
          <p className="text-lg mb-8 opacity-90">
            Subscribe to get exclusive offers, product launches, and fitness tips delivered to your inbox.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
