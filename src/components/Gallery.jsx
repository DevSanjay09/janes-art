import { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import PostCard from './PostCard';
import useStore from '../store/useStore';
import { fetchPosts, deletePost, loginAdmin } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, CheckSquare, X, Trash2 } from 'lucide-react';

const breakpointColumnsObj = {
  default: 3,
  1100: 3,
  800: 2,
  500: 1
};

const Gallery = () => {
  const { posts, setPosts, searchQuery, sortOrder, setSortOrder, isAdmin, removePost } = useStore();
  const [loading, setLoading] = useState(true);

  // Bulk Delete State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState('');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to load posts", error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [setPosts]);

  // Filtering and Sorting
  const filteredPosts = posts
    .filter(post => post.caption?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Handlers
  const toggleSelectPost = (id) => {
    setSelectedPostIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async (e) => {
    e.preventDefault();
    setBulkLoading(true);
    setBulkError('');

    try {
      await loginAdmin(email, password);
      // Delete all selected
      await Promise.all(selectedPostIds.map(id => deletePost(id)));
      
      // Update local store
      selectedPostIds.forEach(id => removePost(id));
      
      // Reset state
      setShowBulkDeleteModal(false);
      setIsSelectMode(false);
      setSelectedPostIds([]);
      setEmail('');
      setPassword('');
    } catch (err) {
      setBulkError('Invalid credentials or failed to delete.');
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-6 py-20 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-accent-pink/20 border-t-accent-pink rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 py-20 min-h-screen relative">
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex bg-dark-lighter border border-white/10 rounded-full p-1">
          <button 
            onClick={() => setSortOrder('newest')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${sortOrder === 'newest' ? 'bg-accent-pink text-dark shadow-md shadow-accent-pink/20' : 'text-white/60 hover:text-white'}`}
          >
            Newest First
          </button>
          <button 
            onClick={() => setSortOrder('oldest')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${sortOrder === 'oldest' ? 'bg-accent-pink text-dark shadow-md shadow-accent-pink/20' : 'text-white/60 hover:text-white'}`}
          >
            Oldest First
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) setSelectedPostIds([]);
            }}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors border ${isSelectMode ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <CheckSquare size={16} className="mr-2" />
            {isSelectMode ? 'Cancel Selection' : 'Select Posts'}
          </button>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/50 text-xl font-light">No artworks found.</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {filteredPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              isSelectMode={isSelectMode}
              isSelected={selectedPostIds.includes(post.id)}
              onToggleSelect={() => toggleSelectPost(post.id)}
            />
          ))}
        </Masonry>
      )}

      {/* Floating Action Bar for Bulk Delete */}
      <AnimatePresence>
        {isSelectMode && selectedPostIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-dark-lighter border border-accent-pink/30 shadow-2xl rounded-full px-6 py-3 flex items-center space-x-6 backdrop-blur-md"
          >
            <span className="text-white font-medium">{selectedPostIds.length} selected</span>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center text-red-400 hover:text-red-300 transition-colors font-medium"
            >
              <Trash2 size={18} className="mr-2" />
              Delete All
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Modal */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkDeleteModal(false)}
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-dark-lighter border border-red-500/30 rounded-2xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowBulkDeleteModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-serif text-white mb-2">Delete {selectedPostIds.length} Posts</h2>
              <p className="text-white/60 text-sm mb-6">Please enter your admin credentials to confirm bulk deletion. This action cannot be undone.</p>
              
              <form onSubmit={handleBulkDelete} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field mb-4"
                    autoFocus
                    required
                  />
                  <input
                    type="password"
                    placeholder="Admin Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                
                {bulkError && <p className="text-red-400 text-sm">{bulkError}</p>}
                
                <button 
                  type="submit" 
                  disabled={bulkLoading}
                  className="w-full btn-primary bg-red-600 hover:bg-red-700 text-white flex justify-center items-center h-12"
                >
                  {bulkLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    `Delete ${selectedPostIds.length} Posts`
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Gallery;
