import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mengambil data dari Firebase secara realtime
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'articles'), (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
      
      // Urutkan dari yang terbaru
      docs.sort((a, b) => {
        const tA = a.tanggal?.seconds || 0;
        const tB = b.tanggal?.seconds || 0;
        if (tB !== tA) return tB - tA;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });
      
      setArticles(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Logika Filter
  const filteredArticles = articles.filter(art => {
    if (filter === 'semua') return true;
    let kat = art.kategori || 'Artikel';
    if (kat === 'Naratif') kat = 'Artikel';
    return kat === filter;
  });

  // Logika Paginasi (Halaman)
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const currentArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilter = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Kembali ke halaman 1 kalau ganti filter
  };

  return (
    <div className="w-full">
      {/* Bagian Hero (Quote) */}
      <section className="py-16 md:py-24 px-6 bg-slate-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 mx-auto w-[95%] md:w-fit max-w-2xl mb-10 overflow-hidden flex flex-col items-center px-6 pt-10 pb-8 md:px-12 md:pt-12 md:pb-10 text-center z-10 border border-slate-100">
            <div className="absolute left-0 top-0 bottom-0 w-3 md:w-4 bg-emerald-500"></div>
            <svg className="w-10 h-10 md:w-14 md:h-14 text-emerald-200 mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <h1 className="text-xl md:text-[28px] font-medium leading-relaxed md:leading-[1.6] text-slate-800 font-sans tracking-tight mb-6">
              Ilmu adalah buruan dan tulisan adalah ikatannya,<br className="hidden md:block" />
              <span className="font-bold inline-block mt-2 md:mt-0">Ikatlah buruanmu dengan tali yang kuat.</span>
            </h1>
            <p className="text-sm md:text-base font-bold text-gray-400 tracking-wider">— Imam Syafi'i —</p>
          </div>
          <p className="text-gray-500 text-sm md:text-base font-montserrat font-bold uppercase tracking-widest leading-relaxed max-w-2xl mx-auto mt-6">
            Ruang Sahal adalah tempat Sahal berbagi ilmu, kisah, dan perspektif.
          </p>
        </div>
      </section>

      {/* Bagian Daftar Tulisan */}
      <section id="tulisan" className="py-16 bg-gray-50/50 min-h-[500px]">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Tulisan Terbaru</h2>
            <div className="h-1 flex-1 mx-6 bg-gray-200 rounded-full opacity-30"></div>
          </div>

          {/* Tombol Filter */}
          <div className="flex flex-wrap gap-3 mb-10">
            {['semua', 'Quotes', 'Artikel'].map((btnFilter) => (
              <button
                key={btnFilter}
                onClick={() => handleFilter(btnFilter)}
                className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${
                  filter === btnFilter
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'border-gray-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-500'
                }`}
              >
                {btnFilter === 'semua' ? 'Semua' : btnFilter}
              </button>
            ))}
          </div>

          {/* List Artikel */}
          <div className="grid gap-6">
            {loading ? (
              // Animasi Loading
              <div className="p-8 bg-white rounded-3xl border border-gray-100 space-y-4">
                <div className="h-6 w-3/4 skeleton rounded"></div>
                <div className="h-4 w-1/4 skeleton rounded"></div>
              </div>
            ) : currentArticles.length === 0 ? (
              // Jika Kosong
              <div className="text-center py-20 text-gray-400 italic bg-white rounded-3xl border border-gray-100">
                Belum ada tulisan di kategori ini.
              </div>
            ) : (
              // Menampilkan Artikel
              currentArticles.map(art => {
                const date = art.tanggal ? new Date(art.tanggal.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                let kat = art.kategori || 'Artikel';
                if (kat === 'Naratif') kat = 'Artikel';
                
                // Ekstrak teks biasa dari HTML untuk snippet
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = art.isi || '';
                const snippet = tempDiv.textContent || tempDiv.innerText || "Tidak ada cuplikan.";

                return (
                  <Link to={`/baca-artikel?id=${art.id}`} key={art.id} className="p-4 md:p-6 bg-white rounded-3xl border border-gray-100 cursor-pointer group flex flex-row items-center gap-4 md:gap-6 shadow-sm hover:border-emerald-500 hover:-translate-y-1 transition-all">
                    {art.cover_url && (
                      <img src={art.cover_url} className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 object-cover rounded-xl md:rounded-2xl shrink-0 shadow-sm" alt="Cover" />
                    )}
                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <span className="px-2 md:px-3 py-1 bg-emerald-50 text-emerald-500 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg border border-emerald-100 shrink-0">
                          {kat}
                        </span>
                        <span className="text-[10px] md:text-xs text-gray-400 font-medium truncate">{date}</span>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-1 md:mb-2 group-hover:text-emerald-500 transition-colors truncate md:whitespace-normal md:line-clamp-2">
                        {art.judul || 'Tanpa Judul'}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-600 line-clamp-2 leading-relaxed">{snippet}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Paginasi */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-5 mt-12 pt-8 border-t border-gray-200/50">
              <span className="text-sm font-bold text-slate-400 tracking-wider">Halaman {currentPage} dari {totalPages}</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setCurrentPage(prev => prev - 1); document.getElementById('tulisan').scrollIntoView(); }}
                  disabled={currentPage === 1}
                  className="px-6 py-2.5 rounded-full bg-white border border-gray-200 text-slate-600 font-bold hover:border-emerald-500 hover:text-emerald-500 transition-all disabled:opacity-40 shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7"></path></svg>
                  Sebelumnya
                </button>
                <button 
                  onClick={() => { setCurrentPage(prev => prev + 1); document.getElementById('tulisan').scrollIntoView(); }}
                  disabled={currentPage === totalPages}
                  className="px-6 py-2.5 rounded-full bg-white border border-gray-200 text-slate-600 font-bold hover:border-emerald-500 hover:text-emerald-500 transition-all disabled:opacity-40 shadow-sm flex items-center gap-2"
                >
                  Selanjutnya
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bagian Kolaborasi (WA) */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 font-sans tracking-tight">Mari Berdiskusi & Berkolaborasi</h2>
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-8">Jika ingin berdiskusi, berbagi perspektif, ide kolaborasi, atau memiliki pertanyaan, silakan hubungi saya.</p>
          <a href="https://wa.me/6282352240356" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl hover:-translate-y-1">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            Hubungi via WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}