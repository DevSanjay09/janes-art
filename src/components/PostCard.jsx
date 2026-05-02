import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import Carousel from './Carousel';
import useStore from '../store/useStore';
import { deletePost, loginAdmin } from '../lib/api';

// Helper function to format date
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const PostCard = ({ post, isSelectMode, isSelected, onToggleSelect }) => {
  const { isAdmin, removePost } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setError('');
  };

  const confirmDelete = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Re-verify credentials before deleting
      await loginAdmin(email, password);
      await deletePost(post.id);
      removePost(post.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className={`glass-card mb-6 relative ${isSelectMode ? 'cursor-pointer transition-transform hover:scale-[1.02]' : ''} ${isSelected ? 'ring-2 ring-accent-pink' : ''}`}
        onClick={() => isSelectMode && onToggleSelect()}
      >
        {isSelectMode && (
          <div className="absolute top-4 left-4 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors bg-black/50 backdrop-blur-sm"
               style={{ borderColor: isSelected ? '#FFAACC' : 'rgba(255,255,255,0.5)' }}>
            {isSelected && <div className="w-3 h-3 rounded-full bg-accent-pink" />}
          </div>
        )}
        <Carousel images={post.images || []} />
        
        <div className="p-5">
          <p className="text-white/90 text-sm md:text-base font-light leading-relaxed mb-3">
            {post.caption}
          </p>
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-accent-gold/70 font-medium uppercase tracking-wider">
              {timeAgo(post.createdAt)}
            </p>
            {isAdmin && !isSelectMode && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}
                className="text-white/40 hover:text-red-500 transition-colors p-1 z-10 relative"
                title="Delete post"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-dark-lighter border border-red-500/30 rounded-2xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-serif text-white mb-2">Delete Post</h2>
              <p className="text-white/60 text-sm mb-6">Please enter your admin credentials to confirm deletion. This action cannot be undone.</p>
              
              <form onSubmit={confirmDelete} className="space-y-4">
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
                
                {error && <p className="text-red-400 text-sm">{error}</p>}
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary bg-red-600 hover:bg-red-700 hover:border-transparent text-white border-transparent flex justify-center items-center h-12"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PostCard;
