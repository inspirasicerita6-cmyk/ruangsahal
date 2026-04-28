export default async function (request, context) {
    const url = new URL(request.url);

    // 1. SATPAM MENGECEK: Apakah ini halaman baca-artikel? (Bisa dengan atau tanpa .html)
    if (!url.pathname.includes('baca-artikel')) {
        return context.next(); // Lepaskan jika bukan halaman artikel
    }

    const id = url.searchParams.get('id');
    // Jika tidak ada ID, lepaskan
    if (!id) {
        return context.next();
    }

    try {
        // Ambil HTML asli halaman webmu
        const response = await context.next();
        let html = await response.text();

        // Tanya ke database Firebase
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/webproject-6d706/databases/(default)/documents/articles/${id}`;
        const dbRes = await fetch(firestoreUrl);

        if (dbRes.ok) {
            const dbData = await dbRes.json();
            
            if (dbData && dbData.fields) {
                const title = dbData.fields.judul?.stringValue || 'Ruang Sahal';
                const coverUrl = dbData.fields.og_image_url?.stringValue || dbData.fields.cover_url?.stringValue || 'https://via.placeholder.com/800x400.png?text=Ruang+Sahal';
                let rawIsi = dbData.fields.isi?.stringValue || 'Menyusun Kata, Merangkai Makna.';
                let snippet = rawIsi.replace(/(<([^>]+)>)/gi, "").substring(0, 150) + '...';

                // Rakit Kode Injeksi
                const metaTags = `
<meta property="og:title" content="${title}">
<meta property="og:description" content="${snippet}">
<meta property="og:image" content="${coverUrl}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${request.url}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
`;
                // Suntikkan tepat sebelum </head>
                html = html.replace(/<\/head>/i, `${metaTags}\n</head>`);
            }
        }

        // Kembalikan HTML yang sudah disuntik gambar
        return new Response(html, {
            headers: { 'content-type': 'text/html;charset=UTF-8' }
        });

    } catch (error) {
        console.log('Error Satpam:', error);
        return context.next();
    }
}
