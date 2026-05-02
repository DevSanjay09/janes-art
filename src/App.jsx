import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import useStore from './store/useStore';
import { fetchSettings } from './lib/api';

function App() {
  const { setSiteSettings } = useStore();

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSettings();
      if (data) {
        setSiteSettings(data);
      }
    };
    loadSettings();
  }, [setSiteSettings]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
