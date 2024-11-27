import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Footer = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Privacy Policy Section */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection('privacy')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Privacy Policy</h3>
              {expandedSection === 'privacy' ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {expandedSection === 'privacy' && (
              <div className="text-gray-600 space-y-2 pl-4 text-sm">
                <p className="font-medium">We prioritize your privacy and data security. Our privacy policy outlines:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Data collection and usage</li>
                  <li>Storage security measures</li>
                  <li>User rights and controls</li>
                  <li>Cookie policy</li>
                  <li>Third-party integrations</li>
                  <li>Data retention periods</li>
                </ul>
              </div>
            )}
          </div>

          {/* Terms of Use Section */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection('terms')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Terms of Use</h3>
              {expandedSection === 'terms' ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {expandedSection === 'terms' && (
              <div className="text-gray-600 space-y-2 pl-4 text-sm">
                <p className="font-medium">Our terms outline the guidelines for using RecordNow:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>User responsibilities</li>
                  <li>Content ownership</li>
                  <li>Usage limitations</li>
                  <li>Account management</li>
                  <li>Prohibited activities</li>
                  <li>Service modifications</li>
                </ul>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection('contact')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
              {expandedSection === 'contact' ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {expandedSection === 'contact' && (
              <div className="text-gray-600 space-y-2 pl-4 text-sm">
                <p className="font-medium">Get in touch with Ignite Consulting:</p>
                <p>Email: <a href="mailto:contact@igniteitserve.com" className="text-primary-600 hover:text-primary-700">contact@igniteitserve.com</a></p>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} RecordNow by Ignite Consulting. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;