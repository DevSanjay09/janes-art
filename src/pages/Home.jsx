import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';
import AdminModal from '../components/AdminModal';

const Home = () => {
  return (
    <main className="min-h-screen bg-dark w-full">
      <Navbar />
      <Hero />
      <Gallery />
      <Footer />
      <AdminModal />
    </main>
  );
};

export default Home;
