import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function DashboardAdmin() {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('semua');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Proteksi Halaman
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user || user.isAnonymous) navigate('/');
    });

    const unsubData = onSnapshot(collection(db, 'articles'), (snapshot) => {
      const docs = [];
      snapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));
      setArticles(docs.sort((a, b) => (b.tanggal?.seconds || 0) - (a.tanggal?.seconds || 0)));
      setLoading(false);
    });

    return () => { unsubAuth(); unsubData(); };
  }, [navigate]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Hapus tulisan "${title}"?`)) {
      await deleteDoc(doc(db, 'articles', id));
    }
  };

  const filtered = articles.filter(art => filter === 'semua' ? true : (art.kategori || 'Artikel') === filter);

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-4xl text-slate-900 mb-2">Manajemen Konten</h1>
          <p className="text-gray-500">Kelola semua tulisan Ruang Sahal.</p>
        </div>
        <Link to="/editor" className="bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg">+ Tulis Baru</Link>
      </header>

      <div className="flex gap-3 mb-6">
        {['semua', 'Quotes', 'Artikel'].map(k => (
          <button key={k} onClick={() => setFilter(k)} className={`px-5 py-2 rounded-full border text-sm font-medium ${filter === k ? 'bg-primary text-white' : 'bg-white text-slate-600'}`}>{k}</button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Judul</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Kategori</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan="3" className="p-10 text-center animate-pulse">Memuat data...</td></tr> : 
              filtered.map(art => (
              <tr key={art.id} className="group hover:bg-emerald-50/30 transition-all">
                <td className="px-8 py-5">
                  <span className="font-bold text-slate-800 block">{art.judul || 'Tanpa Judul'}</span>
                  <span className="text-xs text-gray-400 italic">ID: {art.id}</span>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${art.kategori === 'Quotes' ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>{art.kategori || 'Artikel'}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => navigate(`/editor?id=${art.id}`)} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md text-sm font-bold">Edit</button>
                    <button onClick={() => handleDelete(art.id, art.judul)} className="px-3 py-1 bg-red-50 text-red-500 rounded-md text-sm font-bold">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}