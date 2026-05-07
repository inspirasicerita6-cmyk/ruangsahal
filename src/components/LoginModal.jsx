import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kalau state isOpen = false, jangan tampilkan apa-apa (sembunyikan modal)
  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose(); // Tutup modal setelah berhasil
      navigate('/dashboard'); // Arahkan ke halaman dashboard
    } catch (err) {
      setError("Email atau password salah!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
        <header className="mb-8 text-center">
          <h2 className="font-serif text-3xl text-slate-900 mb-2">Akses Admin</h2>
          <p className="text-gray-500 text-sm">Masuk untuk mengelola tulisan Anda.</p>
        </header>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email</label>
            <input type="email" required placeholder="admin@ruangsahal.com" 
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Password</label>
            <input type="password" required placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          <div className="pt-4 flex flex-col gap-3">
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center">
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
            <button type="button" onClick={onClose} className="w-full text-gray-400 py-2 text-sm font-medium hover:text-slate-800 transition-colors">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}