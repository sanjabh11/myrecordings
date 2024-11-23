import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';

const SharingOptions = ({ recording }) => {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const { user } = useAuth();

  // Generate sharing URL when component mounts or recording changes
  React.useEffect(() => {
    if (recording?.public_url) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/play/${recording.share_token}`);
    }
  }, [recording]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const togglePublicAccess = async () => {
    if (!recording || !user) return;

    try {
      const { error } = await supabase
        .from('recordings')
        .update({ is_public: !isPublic })
        .eq('id', recording.id);

      if (error) throw error;
      setIsPublic(!isPublic);
    } catch (err) {
      console.error('Failed to update sharing settings:', err);
    }
  };

  const handleShare = (platform) => {
    if (!shareUrl) return;
    
    const text = 'Check out my recording on RecordNow!';
    const url = shareUrl;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (!recording) return null;

  return (
    <div className="sharing-options p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Share Your Recording</h3>
      
      <div className="share-controls space-y-4">
        {/* Public/Private Toggle */}
        {user && (
          <div className="flex items-center justify-between">
            <span>Make Recording Public</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={togglePublicAccess}
              />
              <span className="slider round"></span>
            </label>
          </div>
        )}

        {/* Share Link */}
        <div className="share-link-container">
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-2 border rounded-md"
            />
            <button 
              onClick={() => copyToClipboard(shareUrl)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="social-share-buttons flex gap-2">
          <button 
            onClick={() => handleShare('twitter')}
            className="flex-1 p-2 bg-[#1DA1F2] text-white rounded-md hover:bg-opacity-90"
          >
            Twitter
          </button>
          <button 
            onClick={() => handleShare('facebook')}
            className="flex-1 p-2 bg-[#4267B2] text-white rounded-md hover:bg-opacity-90"
          >
            Facebook
          </button>
          <button 
            onClick={() => handleShare('linkedin')}
            className="flex-1 p-2 bg-[#0077b5] text-white rounded-md hover:bg-opacity-90"
          >
            LinkedIn
          </button>
        </div>

        {/* Embed Code */}
        <div className="embed-code mt-4">
          <p className="text-sm text-gray-600 mb-2">Embed this recording:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={`<iframe src="${shareUrl}/embed" width="100%" height="180" frameborder="0"></iframe>`}
              readOnly
              className="flex-1 p-2 border rounded-md font-mono text-sm"
            />
            <button 
              onClick={() => copyToClipboard(`<iframe src="${shareUrl}/embed" width="100%" height="180" frameborder="0"></iframe>`)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharingOptions;