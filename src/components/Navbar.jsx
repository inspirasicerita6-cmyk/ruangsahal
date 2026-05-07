import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Navbar({ onOpenLogin }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !currentUser.isAnonymous) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/'));
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <svg className="w-8 h-8 text-emerald-500 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C10 14.52 12 13 13 12"></path>
          </svg>
          <span className="text-2xl font-semibold tracking-tight text-slate-800">Ruang Sahal</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden md:block text-xs text-gray-400 font-medium">{user.email}</span>
              <Link to="/dashboard" className="hidden md:block text-slate-500 hover:text-slate-800 text-sm font-medium">Dashboard</Link>
              <Link to="/admin" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg transition-all">+ Tulis Baru</Link>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-600 text-sm font-bold ml-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/" className="hidden md:block text-slate-600 font-medium hover:text-emerald-500 transition-colors">Beranda</Link>
              <button onClick={onOpenLogin} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-semibold shadow-sm transition-all">Login Admin</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}