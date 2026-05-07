import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';

import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail'; // Tambahkan ini
import DashboardAdmin from './pages/DashboardAdmin';
import Editor from './pages/Editor';

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      <Navbar onOpenLogin={() => setIsLoginOpen(true)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Tambahkan rute baru ini */}
          <Route path="/baca-artikel" element={<ArticleDetail />} />
          <Route path="/dashboard" element={<DashboardAdmin />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/admin" element={<Editor />} /> {/* Supaya link Navbar tadi jalan */}
        </Routes>
      </main>

      <Footer />
    </div>
  );
}