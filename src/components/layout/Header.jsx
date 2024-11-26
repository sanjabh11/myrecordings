import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="header">
      <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
        <Link to="/" className="logo">RecordNow</Link>
        <nav>
          <ul className="flex items-center gap-8">
            <li><Link to="/">Home</Link></li>
            <li><Link to="#features">Features</Link></li>
            {user ? (
              <>
                <li><Link to="/record" className="cta-button">Start Recording</Link></li>
                <li><Link to="/account" className="text-gray-600 hover:text-primary-600 transition-colors">My Account</Link></li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors">Login</Link></li>
                <li><Link to="/signup" className="cta-button">Sign Up</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;