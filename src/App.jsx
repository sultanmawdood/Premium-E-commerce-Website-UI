import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './app/components/Navbar';
import { CartProvider } from './app/context/CartContext';
import { ThemeProvider } from './app/context/ThemeContext';
import Products from './app/components/Products';

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
          <div className="App min-h-screen bg-background text-foreground">
            <Navbar />
            <Routes>
              <Route path="/" element={<Products />} />
              <Route path="/products" element={<Products />} />
              <Route path="*" element={<Products />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;