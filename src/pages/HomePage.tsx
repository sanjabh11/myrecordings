import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const HomePage: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero">
        <div className="container mx-auto">
          <h1>Unleash Your Inner Voice with Sing-A-Song</h1>
          <p>
            Record up to 2 minutes of audio effortlessly. No sign-up required for basic features.
          </p>
          <Link
            to="/record"
            className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Recording
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Simple. Fun. Musical.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="text-primary text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold mb-2">Quick Recording</h3>
              <p className="text-gray-600">
                Start recording with just one click. Perfect for spontaneous musical moments.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="text-primary text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold mb-2">Share with Friends</h3>
              <p className="text-gray-600">
                Share your recordings with friends and family in just seconds.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="text-primary text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Mobile Ready</h3>
              <p className="text-gray-600">
                Record and share from any device - desktop or mobile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Ready to Start Recording?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users creating beautiful music memories.
          </p>
          <Link
            to="/record"
            className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
