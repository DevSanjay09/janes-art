import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const Hero = () => {
  const { siteSettings } = useStore();
  
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background */}
      {siteSettings.backgroundType === 'video' ? (
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src={siteSettings.backgroundUrl} type="video/mp4" />
        </video>
      ) : (
        <img src={siteSettings.backgroundUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      )}

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-dark/60 via-dark/40 to-dark"></div>

      {/* Content */}
      <div className="relative z-20 text-center px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 drop-shadow-[0_0_15px_rgba(255,170,204,0.3)]"
        >
          {siteSettings.siteName}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-accent-pink-light/80 text-lg md:text-xl max-w-2xl mx-auto font-light tracking-wide"
        >
          Cinematic visual experiences and timeless moments.
        </motion.p>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        <span className="text-accent-pink/50 text-sm tracking-widest uppercase mb-2">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-accent-pink/50 to-transparent"></div>
      </motion.div>
    </section>
  );
};

export default Hero;
