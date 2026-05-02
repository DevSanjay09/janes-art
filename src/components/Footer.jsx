import useStore from '../store/useStore';

const Footer = () => {
  const { setAdminModalOpen, siteSettings } = useStore();

  return (
    <footer className="py-10 border-t border-white/5 text-center relative z-10">
      <p className="text-white/40 text-sm font-light">
        {siteSettings.footerText}
      </p>
      
      {/* Hidden Admin Access */}
      <button 
        onClick={() => setAdminModalOpen(true)}
        className="mt-4 text-xs text-white/10 hover:text-white/30 transition-colors"
      >
        Admin
      </button>
    </footer>
  );
};

export default Footer;
