import { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';
import useStore from '../store/useStore';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { searchQuery, setSearchQuery, siteSettings } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark/80 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="text-2xl md:text-3xl font-serif text-white tracking-wider">
            {siteSettings.siteName}
          </a>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center bg-white/10 rounded-full px-4 py-2 border border-white/10 focus-within:border-accent-pink/50 focus-within:ring-1 focus-within:ring-accent-pink transition-all w-64 lg:w-96">
          <Search size={18} className="text-white/60 mr-2" />
          <input
            type="text"
            placeholder="Search captions..."
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 right-0 bg-dark-lighter p-4 border-b border-white/10"
        >
          <div className="flex items-center bg-white/10 rounded-full px-4 py-2 border border-white/10">
            <Search size={18} className="text-white/60 mr-2" />
            <input
              type="text"
              placeholder="Search captions..."
              className="bg-transparent border-none outline-none text-white w-full placeholder-white/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
