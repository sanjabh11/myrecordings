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
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="floating-notes">
              <FaMusic className="note-1" />
              <FaMusic className="note-2" />
              <FaMusic className="note-3" />
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Capture Your Voice,{' '}
                <span className="text-yellow-300">
                  Share Your Story
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
                Whether it's a melody in your heart or an idea in your mind - record, save, and share your songs or voice notes in seconds
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  to="/record" 
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg 
                           hover:bg-blue-50 transform hover:-translate-y-1 transition-all duration-200 
                           shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <FaMicrophone className="text-xl" />
                  Start Recording Now
                </Link>
                {!user && (
                  <Link 
                    to="/signup" 
                    className="px-8 py-4 bg-transparent border-2 border-white text-white 
                             rounded-lg font-semibold text-lg hover:bg-white/10 
                             transform hover:-translate-y-1 transition-all duration-200 
                             flex items-center gap-2"
                  >
                    <FaCloud className="text-xl" />
                    Join Free
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute left-0 bottom-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        <section className="py-24 bg-white" id="features">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
              Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Recording Features */}
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold text-primary-600 mb-6">Recording</h3>
                <div className="feature-card">
                  <div className="icon-wrapper">
                    <FaMicrophone className="text-4xl text-primary-600" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Quick Recording</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>2-minute recording with Anonymous access</li>
                    <li>One-click recording start/stop</li>
                    <li>Start recording without signup</li>
                    <li>Real-time waveform visualization</li>
                    <li>Visual recording timer</li>
                  </ul>
                </div>
              </div>

              {/* Compatibility Features */}
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold text-primary-600 mb-6">Compatibility</h3>
                <div className="feature-card">
                  <div className="icon-wrapper">
                    <FaShare className="text-4xl text-primary-600" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Universal Access</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Browser-Based Recording- No app installation needed</li>
                    <li>Works on all modern browsers</li>
                    <li>Mobile-friendly interface</li>
                    <li>Instant Social Sharing of recorded links</li>
                  </ul>
                </div>
              </div>

              {/* Storage Features */}
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold text-primary-600 mb-6">Storage</h3>
                <div className="feature-card">
                  <div className="icon-wrapper">
                    <FaCloud className="text-4xl text-primary-600" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Smart Storage</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Local storage for 30 days</li>
                    <li>Up to 10 free recordings</li>
                    <li>Cloud storage for registered users</li>
                    <li>Automatic local backup</li>
                    <li>Cross-device access</li>
                  </ul>
                </div>
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