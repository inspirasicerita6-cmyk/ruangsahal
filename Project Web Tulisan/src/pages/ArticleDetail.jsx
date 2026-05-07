import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ArticleDetail() {
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('id');
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      if (!articleId) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const docSnap = await getDoc(doc(db, 'articles', articleId));
        if (docSnap.exists()) {
          setArticle(docSnap.data());
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [articleId]);

  // Fungsi Berbagi
  const shareWA = () => {
    const url = window.location.href;
    const text = article?.judul || "Ruang Sahal";
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}%0A%0A${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-16 w-full">
        <div className="space-y-8 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="h-12 w-full skeleton rounded-xl"></div>
          <div className="h-64 w-full skeleton rounded-xl"></div>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-3xl text-slate-800 mb-4">Tulisan tidak ditemukan</h2>
        <Link to="/" className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg">Kembali ke Beranda</Link>
      </main>
    );
  }

  const isQuotes = article.kategori === 'Quotes';
  const dateStr = article.tanggal ? new Date(article.tanggal.seconds * 1000).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-16 flex-1 w-full relative">
      {/* Toast Notifikasi */}
      <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl transition-opacity duration-300 z-[100] text-sm flex items-center gap-2 ${showToast ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Tautan disalin!
      </div>

      <article>
        {isQuotes ? (
          /* Tampilan Layout Quotes */
          <div className="flex flex-col items-center">
            <div className="relative bg-white rounded-2xl md:rounded-[2rem] shadow-xl shadow-slate-200/50 w-full md:w-fit max-w-2xl px-8 py-10 text-center border border-slate-100">
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-primary rounded-l-2xl md:rounded-l-[2rem]"></div>
              <svg className="w-12 h-12 text-emerald-200 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
              <h1 className="text-xl md:text-2xl font-bold leading-relaxed text-slate-800 mb-6" dangerouslySetInnerHTML={{ __html: (article.isi || '').replace(/\n/g, '<br>') }}></h1>
              <p className="text-sm font-bold text-gray-400">— {article.penulis} —</p>
            </div>
            <div className="mt-8"><span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100">{dateStr}</span></div>
          </div>
        ) : (
          /* Tampilan Layout Artikel Biasa */
          <div className="bg-white p-6 md:p-12 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm">
            <header className="mb-10">
              <h1 className="font-serif text-3xl md:text-4xl leading-tight text-slate-900 mb-6">{article.judul}</h1>
              <div className="flex items-center gap-4 py-5 border-y border-gray-100">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-primary shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{article.penulis}</p>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{dateStr}</p>
                </div>
              </div>
            </header>
            <div className="prose max-w-none text-base md:text-lg text-slate-700 leading-relaxed">
              {article.cover_url && (
                <img src={article.cover_url} className="w-full h-64 md:h-96 object-cover rounded-2xl md:rounded-3xl mb-8" alt="Cover" />
              )}
              <div dangerouslySetInnerHTML={{ __html: article.isi }}></div>
            </div>
          </div>
        )}

        {/* Tombol Bagikan */}
        <div className="mt-16 flex flex-col items-center gap-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bagikan tulisan ini</p>
          <div className="flex items-center gap-4">
            <button onClick={shareWA} className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg></button>
            <button onClick={copyLink} className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200/60">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-gray-400 italic text-sm">"Setiap kata adalah jejak perjalanan makna."</p>
            <Link to="/" className="group flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all bg-white px-6 py-3 rounded-full border border-emerald-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg> Kembali ke Beranda
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}