import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SharingOptions = ({ recording, isAuthenticated }) => {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform) => {
    if (!recording || !recording.public_url) return;
    
    const text = 'Check out my recording on RecordNow!';
    const url = recording.public_url;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (!recording) return null;

  return (
    <div className="sharing-options">
      <h3 className="text-xl font-semibold mb-4">Share Your Recording</h3>
      
      {!isAuthenticated ? (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg mb-4">
          Sign in to share your recordings with others!
        </div>
      ) : (
        <div className="share-buttons">
          <button 
            className="copy-link"
            onClick={() => copyToClipboard(recording.public_url)}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <div className="social-share">
            <button 
              className="twitter"
              onClick={() => handleShare('twitter')}
            >
              Share on Twitter
            </button>
            <button 
              className="facebook"
              onClick={() => handleShare('facebook')}
            >
              Share on Facebook
            </button>
            <button 
              className="linkedin"
              onClick={() => handleShare('linkedin')}
            >
              Share on LinkedIn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharingOptions;