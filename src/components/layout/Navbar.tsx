import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-navbar">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Sing-A-Song</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary">Home</Link>
            <Link to="/record" className="text-gray-600 hover:text-primary">Record</Link>
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <Link to="/" className="block py-2 text-gray-600 hover:text-primary">Home</Link>
            <Link to="/record" className="block py-2 text-gray-600 hover:text-primary">Record</Link>
            <button className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors mt-2">
              Sign In
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
