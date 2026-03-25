import { Link } from 'react-router';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black">K</span>
              </div>
              <span className="font-black tracking-tight">KINGSPORTS</span>
            </div>
            <p className="text-sm opacity-80">
              Premium sports clothing and gear for athletes and enthusiasts.
            </p>
          </div>

          <div>
            <h3 className="mb-4">Shop</h3>
            <div className="flex flex-col gap-2">
              <Link to="/shop/men" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Men
              </Link>
              <Link to="/shop/women" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Women
              </Link>
              <Link to="/shop/shoes" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Shoes
              </Link>
              <Link to="/shop/accessories" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Accessories
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4">Support</h3>
            <div className="flex flex-col gap-2">
              <Link to="/contact" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Contact Us
              </Link>
              <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Shipping & Returns
              </a>
              <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Size Guide
              </a>
              <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                FAQs
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4">Stay Connected</h3>
            <p className="text-sm opacity-80 mb-4">
              Subscribe to get special offers, free giveaways, and updates.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm opacity-80">
          © 2026 KingSports. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
