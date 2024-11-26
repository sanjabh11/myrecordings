import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FaMicrophone, FaShare, FaLock, FaClock, FaMusic } from 'react-icons/fa';

const Home = () => {
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
          
          <div className="container mx-auto px-4 py-24 relative z-10">
            <img 
              src="/logo.png" 
              alt="Ignite Consulting" 
              className="w-32 h-auto mb-8 mx-auto"
            />
            <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 text-gray-900">
              Unleash Your Inner Voice with Sing-A-Song
            </h1>
            <p className="text-xl md:text-2xl text-center mb-12 text-gray-600 max-w-3xl mx-auto">
              Record up to 2 minutes of audio effortlessly. No sign-up required for basic features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/record" 
                className="primary-button flex items-center gap-2 text-lg"
              >
                <FaMicrophone />
                Start Recording
              </Link>
              <Link 
                to="/login" 
                className="secondary-button flex items-center gap-2 text-lg"
              >
                Try Premium Features
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white" id="features">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
              Why Choose Sing-A-Song?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="feature-card">
                <div className="icon-wrapper">
                  <FaClock className="feature-icon" />
                </div>
                <h3>Quick & Easy</h3>
                <p>Record up to 2 minutes of high-quality audio instantly</p>
              </div>
              <div className="feature-card">
                <div className="icon-wrapper">
                  <FaShare className="feature-icon" />
                </div>
                <h3>Share Instantly</h3>
                <p>Share your recordings with friends and family via link</p>
              </div>
              <div className="feature-card">
                <div className="icon-wrapper">
                  <FaLock className="feature-icon" />
                </div>
                <h3>Secure Storage</h3>
                <p>Your recordings are safely stored and protected</p>
              </div>
              <div className="feature-card">
                <div className="icon-wrapper">
                  <FaMicrophone className="feature-icon" />
                </div>
                <h3>Professional Quality</h3>
                <p>Crystal clear audio recording and playback</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-8">Ready to Start Recording?</h2>
            <p className="text-xl mb-12 opacity-90">Join thousands of users who trust Sing-A-Song</p>
            <Link 
              to="/record" 
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all transform hover:-translate-y-1"
            >
              <FaMicrophone />
              Start Recording Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;