import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ArrowLeft, Settings, Image as ImageIcon } from 'lucide-react';
import useStore from '../store/useStore';
import { uploadImages, createPost, updateSettings } from '../lib/api';

const AdminDashboard = () => {
  const { isAdmin, addPost, siteSettings, setSiteSettings } = useStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'settings'
  
  // Post State
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Settings State
  const bgFileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    siteName: siteSettings.siteName,
    footerText: siteSettings.footerText,
    backgroundType: siteSettings.backgroundType,
    backgroundUrl: siteSettings.backgroundUrl
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [bgPreview, setBgPreview] = useState(siteSettings.backgroundType === 'image' ? siteSettings.backgroundUrl : null);
  const [bgFile, setBgFile] = useState(null);

  // Sync state if store updates
  useEffect(() => {
    setFormData({
      siteName: siteSettings.siteName,
      footerText: siteSettings.footerText,
      backgroundType: siteSettings.backgroundType,
      backgroundUrl: siteSettings.backgroundUrl
    });
    if (siteSettings.backgroundType === 'image' && !bgFile) {
      setBgPreview(siteSettings.backgroundUrl);
    }
  }, [siteSettings]);

  // Redirect if not admin
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  // --- POST HANDLERS ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one image.');
      return;
    }
    if (!caption.trim()) {
      setError('Please enter a caption.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const imageUrls = await uploadImages(files);
      const newPost = await createPost(imageUrls, caption);
      addPost(newPost);
      setFiles([]);
      setPreviews([]);
      setCaption('');
      setSuccess('Post published successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload post. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- SETTINGS HANDLERS ---
  const handleBgFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBgFile(file);
      setBgPreview(URL.createObjectURL(file));
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');
    
    try {
      let finalUrl = formData.backgroundUrl;
      
      // If user uploaded a new image, we must upload it first
      if (formData.backgroundType === 'image' && bgFile) {
        const uploadedUrls = await uploadImages([bgFile]);
        finalUrl = uploadedUrls[0];
      }

      const updatedSettings = {
        ...formData,
        backgroundUrl: finalUrl
      };

      const saved = await updateSettings(updatedSettings);
      setSiteSettings(saved);
      setFormData(saved);
      setBgFile(null); // Clear pending file upload
      
      setSettingsSuccess('Settings updated successfully!');
      setTimeout(() => setSettingsSuccess(''), 3000);
    } catch (err) {
      setSettingsError('Failed to save settings.');
      console.error(err);
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark pt-20 px-6 pb-20">
      <div className="container mx-auto max-w-3xl">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-white/60 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Site
        </button>
        
        <h1 className="text-4xl font-serif text-white mb-8">Admin Dashboard</h1>

        {/* TABS */}
        <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'posts' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <ImageIcon size={18} className="mr-2" />
            Manage Posts
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={18} className="mr-2" />
            Site Settings
          </button>
        </div>
        
        {/* POSTS TAB */}
        {activeTab === 'posts' && (
          <div className="bg-dark-lighter border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-medium text-white mb-6">Create New Post</h2>
            
            <form onSubmit={handlePostSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Images</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-accent-pink/50 hover:bg-white/5 transition-all"
                >
                  <Upload size={32} className="text-white/40 mb-4" />
                  <p className="text-white/60">Click to upload images</p>
                  <p className="text-xs text-white/40 mt-2">Supports JPG, PNG, WEBP</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              {previews.length > 0 && (
                <div className="flex gap-4 overflow-x-auto py-2">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-white/20">
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="input-field min-h-[120px] resize-y"
                />
              </div>
              
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-green-400 text-sm">{success}</p>}
              
              <div className="flex justify-end pt-4 border-t border-white/10">
                <button type="submit" disabled={loading} className="btn-primary bg-accent-pink hover:bg-accent-pink-light">
                  {loading ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-dark-lighter border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-medium text-white mb-6">Global Site Settings</h2>
            
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Site Name (Header & Landing)</label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Footer Text</label>
                <input
                  type="text"
                  value={formData.footerText}
                  onChange={(e) => setFormData({...formData, footerText: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="block text-sm font-medium text-white/70 mb-2">Background Type</label>
                <div className="flex space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, backgroundType: 'video'})}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.backgroundType === 'video' ? 'bg-accent-pink text-dark' : 'bg-transparent border border-white/20 text-white hover:bg-white/10'}`}
                  >
                    Video URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, backgroundType: 'image'})}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.backgroundType === 'image' ? 'bg-accent-pink text-dark' : 'bg-transparent border border-white/20 text-white hover:bg-white/10'}`}
                  >
                    Static Image
                  </button>
                </div>

                {formData.backgroundType === 'video' ? (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Video URL (.mp4 direct link)</label>
                    <input
                      type="url"
                      value={formData.backgroundUrl}
                      onChange={(e) => setFormData({...formData, backgroundUrl: e.target.value})}
                      placeholder="https://example.com/video.mp4"
                      className="input-field"
                      required={formData.backgroundType === 'video'}
                    />
                    <p className="text-xs text-white/40 mt-2">Note: Must be a direct video file (e.g. Cloudinary). Google Drive share links will not work as background videos.</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Upload Background Image</label>
                    <div className="flex items-center space-x-4">
                      {bgPreview && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/20 flex-shrink-0">
                          <img src={bgPreview} alt="bg preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div 
                        onClick={() => bgFileInputRef.current?.click()}
                        className="flex-grow border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-accent-pink/50 hover:bg-white/5 transition-all"
                      >
                        <Upload size={24} className="text-white/40 mb-2" />
                        <p className="text-white/60 text-sm">Click to choose image</p>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={bgFileInputRef} 
                      onChange={handleBgFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                )}
              </div>
              
              {settingsError && <p className="text-red-400 text-sm">{settingsError}</p>}
              {settingsSuccess && <p className="text-green-400 text-sm">{settingsSuccess}</p>}
              
              <div className="flex justify-end pt-4 border-t border-white/10">
                <button type="submit" disabled={settingsLoading} className="btn-primary bg-accent-pink hover:bg-accent-pink-light">
                  {settingsLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
