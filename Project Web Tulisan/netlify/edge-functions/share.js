// Netlify Edge Function (Versi Pelacak Error)
export default async function (request, context) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    // Jika tidak ada ID, biarkan lewat
    if (!id) {
        return context.next();
    }

    try {
        // Ambil HTML asli
        const response = await context.next();
        let html = await response.text();

        // --- JEJAK 1: PASTIKAN SATPAM BANGUN ---
        // Kita suntikkan tulisan ini tanpa syarat. 
        // Jika tulisan ini saja tidak muncul, berarti Netlify belum mengaktifkan Edge Function-nya.
        html = html.replace(/<\/head>/i, `\n<!-- SANG PENENGAH HADIR DI SINI (SATPAM AKTIF) -->\n</head>`);

        // Coba tanya ke Firebase
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/webproject-6d706/databases/(default)/documents/articles/${id}`;
        const dbRes = await fetch(firestoreUrl);

        if (dbRes.ok) {
            const dbData = await dbRes.json();
            
            if (dbData && dbData.fields) {
                const title = dbData.fields.judul?.stringValue || 'Ruang Sahal';
                const coverUrl = dbData.fields.og_image_url?.stringValue || dbData.fields.cover_url?.stringValue || 'https://via.placeholder.com/800x400.png?text=Ruang+Sahal';
                let rawIsi = dbData.fields.isi?.stringValue || 'Menyusun Kata, Merangkai Makna.';
                let snippet = rawIsi.replace(/(<([^>]+)>)/gi, "").substring(0, 150) + '...';

                const metaTags = `
<!-- JEJAK 2: FIREBASE SUKSES DIBACA -->
<meta property="og:title" content="${title}">
<meta property="og:description" content="${snippet}">
<meta property="og:image" content="${coverUrl}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${request.url}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
`;
                // Timpa jejak 1 dengan jejak 2 (Sukses)
                html = html.replace('<!-- SANG PENENGAH HADIR DI SINI (SATPAM AKTIF) -->', metaTags);
            }
        } else {
            // Jika Firebase menolak (Error Database)
            html = html.replace('<!-- SANG PENENGAH HADIR DI SINI (SATPAM AKTIF) -->', `<!-- ERROR FIREBASE: Status ${dbRes.status} -->`);
        }

        return new Response(html, {
            headers: { 'content-type': 'text/html;charset=UTF-8' }
        });

    } catch (error) {
        // Jika skripnya crash
        console.log('Error Edge Function:', error);
        return context.next();
    }
}