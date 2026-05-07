import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, Timestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import html2canvas from 'html2canvas';

export default function Editor() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [jenis, setJenis] = useState('Artikel');
  const [form, setForm] = useState({ judul: '', penulis: 'Sahal', cover_url: '', tanggal: new Date().toISOString().split('T')[0], isi: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      getDoc(doc(db, 'articles', editId)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setJenis(data.kategori || 'Artikel');
          setForm({
            judul: data.judul || '',
            penulis: data.penulis || 'Sahal',
            cover_url: data.cover_url || '',
            tanggal: data.tanggal ? new Date(data.tanggal.seconds * 1000).toISOString().split('T')[0] : '',
            isi: data.isi || ''
          });
          if (editorRef.current && data.kategori !== 'Quotes') editorRef.current.innerHTML = data.isi;
        }
      });
    }
  }, [editId]);

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isiFinal = jenis === 'Artikel' ? editorRef.current.innerHTML : form.isi;
    
    let payload = { 
      ...form, 
      isi: isiFinal, 
      kategori: jenis, 
      updatedAt: Timestamp.now(),
      tanggal: Timestamp.fromDate(new Date(form.tanggal))
    };

    try {
      if (jenis === 'Quotes') {
        // Logika Foto Quote Otomatis
        const captureArea = document.createElement('div');
        captureArea.style = "position:absolute; left:-9999px; width:600px; padding:50px; background:white; border-left:15px solid #10b981; text-align:center; font-family:sans-serif;";
        captureArea.innerHTML = `<div style="font-size:100px; color:#a7f3d0;">“</div><h1 style="font-size:24px;">${form.isi}</h1><p>— ${form.penulis} —</p>`;
        document.body.appendChild(captureArea);
        
        const canvas = await html2canvas(captureArea);
        const dataUrl = canvas.toDataURL("image/jpeg");
        const storageRef = ref(storage, `previews/${editId || Date.now()}.jpg`);
        await uploadString(storageRef, dataUrl, 'data_url');
        payload.og_image_url = await getDownloadURL(storageRef);
        payload.judul = `Quote: ${form.penulis}`;
        document.body.removeChild(captureArea);
      }

      if (editId) {
        await updateDoc(doc(db, 'articles', editId), payload);
      } else {
        payload.createdAt = Timestamp.now();
        await addDoc(collection(db, 'articles'), payload);
      }
      navigate('/dashboard');
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-serif text-4xl mb-8">{editId ? 'Edit Tulisan' : 'Mulai Menulis'}</h1>
      
      <div className="flex gap-4 mb-10 border-b pb-4">
        {['Artikel', 'Quotes'].map(t => (
          <button key={t} onClick={() => setJenis(t)} className={`px-6 py-2 rounded-xl font-bold ${jenis === t ? 'bg-emerald-50 text-primary border border-emerald-200' : 'text-gray-400'}`}>{t}</button>
        ))}
      </div>

      <form onSubmit={handlePublish} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {jenis === 'Artikel' && <input type="text" placeholder="Judul..." className="p-4 border rounded-xl" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} />}
          <input type="text" placeholder="Nama Penulis..." className="p-4 border rounded-xl" value={form.penulis} onChange={e => setForm({...form, penulis: e.target.value})} />
          <input type="date" className="p-4 border rounded-xl" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} />
          {jenis === 'Artikel' && <input type="text" placeholder="URL Cover..." className="p-4 border rounded-xl" value={form.cover_url} onChange={e => setForm({...form, cover_url: e.target.value})} />}
        </div>

        {jenis === 'Artikel' ? (
          <div ref={editorRef} contentEditable className="min-h-[400px] p-6 border rounded-xl bg-white outline-none focus:border-primary prose max-w-none"></div>
        ) : (
          <textarea rows="5" className="w-full p-6 border rounded-xl outline-none focus:border-primary text-xl" placeholder="Tulis kutipan..." value={form.isi} onChange={e => setForm({...form, isi: e.target.value})} />
        )}

        <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-lg">
          {loading ? 'Memproses...' : 'Publish Tulisan'}
        </button>
      </form>
    </main>
  );
}