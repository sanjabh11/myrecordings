import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FaMicrophone, FaShare, FaLock, FaClock, FaMusic, FaCloud, FaUsers } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/common/Spinner';

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <Header />
      
      <main className="flex-grow">
        <section className="hero relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="floating-notes">
              <FaMusic className="note-1" />
              <FaMusic className="note-2" />
              <FaMusic className="note-3" />
            </div>
          </div>
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 text-gray-900">
                {user ? 'Welcome Back to Your Recording Studio' : 'Unleash Your Inner Voice and Share with the World'}
              </h1>
              <p className="text-xl md:text-2xl text-center mb-12 text-gray-600 max-w-3xl mx-auto">
                {user 
                  ? 'Continue creating amazing recordings and sharing them with the world'
                  : 'Sign up to save your recordings in the cloud and share them with friends!'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/record" 
                  className="primary-button flex items-center gap-2 text-lg"
                >
                  <FaMicrophone />
                  Start Recording
                </Link>
                {!user && (
                  <Link 
                    to="/signup" 
                    className="secondary-button flex items-center gap-2 text-lg"
                  >
                    <FaCloud />
                    Create Free Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white" id="features">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
              Premium Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="feature-card">
                <div className="icon-wrapper">
                  <FaCloud className="text-4xl text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cloud Storage</h3>
                <p>Save all your recordings securely in the cloud and access them from anywhere.</p>
              </div>
              <div className="feature-card">
                <div className="icon-wrapper">
                  <FaShare className="text-4xl text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
                <p>Share your recordings with friends and family with just one click.</p>
              </div>
              <div className="feature-card">
                <div className="icon-wrapper">
                  <FaUsers className="text-4xl text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
                <p>Collaborate with others and create amazing content together.</p>
              </div>
            </div>
            {!user && (
              <div className="text-center mt-12">
                <Link to="/signup" className="primary-button inline-flex items-center gap-2">
                  <FaLock />
                  Unlock All Features
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;