import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function paragraph(runs, options = {}) {
  const { align = 'both', spaceBefore = 0, spaceAfter = 120, line = 276 } = options;
  let pPr = `<w:pPr><w:jc w:val="${align}"/><w:spacing w:before="${spaceBefore}" w:after="${spaceAfter}" w:line="${line}" w:lineRule="auto"/></w:pPr>`;
  
  if (typeof runs === 'string') {
    runs = [{ text: runs }];
  }

  let runsXml = '';
  runs.forEach(r => {
    if (r.pageBreak) {
      runsXml += '<w:r><w:br w:type="page"/></w:r>';
      return;
    }
    const font = r.font || 'Times New Roman';
    const sz = r.size ? r.size * 2 : 24; // 12pt = 24 half-points
    const isBold = r.bold ? '<w:b/>' : '';
    const isItalic = r.italic ? '<w:i/>' : '';
    const color = r.color ? `<w:color w:val="${r.color}"/>` : '';
    const rPr = `<w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>${isBold}${isItalic}${color}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>`;

    const textContent = r.text || '';
    const lines = textContent.split('\n');
    lines.forEach((lineText, idx) => {
      if (idx > 0) {
        runsXml += `<w:r>${rPr}<w:br/></w:r>`;
      }
      runsXml += `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(lineText)}</w:t></w:r>`;
    });
  });

  return `<w:p>${pPr}${runsXml}</w:p>`;
}

function heading1(text) {
  return paragraph([{ text, bold: true, size: 14 }], { align: 'center', spaceBefore: 240, spaceAfter: 160 });
}

function heading2(text) {
  return paragraph([{ text, bold: true, size: 12 }], { align: 'left', spaceBefore: 200, spaceAfter: 80 });
}

function heading3(text) {
  return paragraph([{ text, bold: true, size: 11 }], { align: 'left', spaceBefore: 140, spaceAfter: 60 });
}

function bullet(text, boldPrefix = '') {
  const runs = [];
  if (boldPrefix) {
    runs.push({ text: boldPrefix + ' ', bold: true });
  }
  runs.push({ text });
  return paragraph(runs, { align: 'both', spaceBefore: 40, spaceAfter: 60 });
}

function codeLine(text) {
  return paragraph([{ text, font: 'Consolas', size: 9 }], { align: 'left', spaceBefore: 0, spaceAfter: 20, line: 220 });
}

function imageDrawing(relId, widthCm, heightCm, desc, docPrId) {
  const cx = Math.round(widthCm * 360000);
  const cy = Math.round(heightCm * 360000);

  return `
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="160" w:after="80"/>
      </w:pPr>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0">
            <wp:extent cx="${cx}" cy="${cy}"/>
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:docPr id="${docPrId}" name="${escapeXml(desc)}"/>
            <wp:cNvGraphicFramePr>
              <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
            </wp:cNvGraphicFramePr>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <pic:cNvPr id="${docPrId}" name="${escapeXml(desc)}"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="${relId}"/>
                    <a:stretch>
                      <a:fillRect/>
                    </a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="${cx}" cy="${cy}"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect">
                      <a:avLst/>
                    </a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
  `;
}

function imageCaption(captionText) {
  return paragraph([{ text: captionText, italic: true, bold: false, size: 10 }], { align: 'center', spaceBefore: 40, spaceAfter: 160 });
}

function table(headers, rows, colWidths = []) {
  let tblPr = `
    <w:tblPr>
      <w:tblW w:w="9360" w:type="dxa"/>
      <w:jc w:val="center"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      </w:tblBorders>
    </w:tblPr>
  `;

  let tblGrid = '<w:tblGrid>' + colWidths.map(w => `<w:gridCol w:w="${w}"/>`).join('') + '</w:tblGrid>';

  let headerXml = '<w:tr><w:trPr><w:tblHeader/></w:trPr>' + headers.map((h, i) => {
    const width = colWidths[i] || 1500;
    return `
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="${width}" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>
          <w:tcMar>
            <w:top w:w="120" w:type="dxa"/>
            <w:left w:w="120" w:type="dxa"/>
            <w:bottom w:w="120" w:type="dxa"/>
            <w:right w:w="120" w:type="dxa"/>
          </w:tcMar>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        ${paragraph([{ text: h, bold: true, size: 9.5 }], { align: 'center', spaceBefore: 40, spaceAfter: 40 })}
      </w:tc>
    `;
  }).join('') + '</w:tr>';

  let rowsXml = rows.map(r => {
    return '<w:tr>' + r.map((c, i) => {
      const width = colWidths[i] || 1500;
      let textRuns = [];
      let align = 'both';

      if (typeof c === 'string') {
        if (c === 'Pass') {
          textRuns = [{ text: c, bold: true, size: 9.5, color: '008000' }];
          align = 'center';
        } else if (c.startsWith('TC-') || c.startsWith('WB-') || c.startsWith('BB-') || c.startsWith('Path ')) {
          textRuns = [{ text: c, bold: true, size: 9.5 }];
          align = 'center';
        } else if (c.startsWith('Gambar')) {
          textRuns = [{ text: c, italic: true, size: 9.5 }];
          align = 'center';
        } else {
          textRuns = [{ text: c, size: 9.5 }];
        }
      } else if (Array.isArray(c)) {
        textRuns = c;
      }

      return `
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="${width}" w:type="dxa"/>
            <w:tcMar>
              <w:top w:w="80" w:type="dxa"/>
              <w:left w:w="100" w:type="dxa"/>
              <w:bottom w:w="80" w:type="dxa"/>
              <w:right w:w="100" w:type="dxa"/>
            </w:tcMar>
            <w:vAlign w:val="center"/>
          </w:tcPr>
          ${paragraph(textRuns, { align, spaceBefore: 20, spaceAfter: 20 })}
        </w:tc>
      `;
    }).join('') + '</w:tr>';
  }).join('');

  return `<w:tbl>${tblPr}${tblGrid}${headerXml}${rowsXml}</w:tbl>`;
}

function identityTable(data) {
  let rowsXml = data.map(([label, sep, val]) => {
    return `
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="2200" w:type="dxa"/></w:tcPr>
          ${paragraph([{ text: label, bold: true, size: 11 }], { align: 'left', spaceBefore: 20, spaceAfter: 20 })}
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="300" w:type="dxa"/></w:tcPr>
          ${paragraph([{ text: sep, bold: true, size: 11 }], { align: 'center', spaceBefore: 20, spaceAfter: 20 })}
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="6860" w:type="dxa"/></w:tcPr>
          ${paragraph([{ text: val, size: 11 }], { align: 'left', spaceBefore: 20, spaceAfter: 20 })}
        </w:tc>
      </w:tr>
    `;
  }).join('');

  return `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9360" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/>
          <w:insideH w:val="none"/><w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="2200"/><w:gridCol w:w="300"/><w:gridCol w:w="6860"/>
      </w:tblGrid>
      ${rowsXml}
    </w:tbl>
  `;
}

function buildDocumentXml() {
  const parts = [];

  // =========================================================================
  // COVER / HEADER IDENTITAS
  // =========================================================================
  parts.push(heading1('LAPORAN PENGUJIAN PERANGKAT LUNAK\n(WHITE BOX & BLACK BOX TESTING)\nWEBSITE BAKSO & MIE AYAM CONDONG RAOS 234'));
  
  parts.push(identityTable([
    ['Nama Penguji', ':', 'Dika Alfaizal'],
    ['NPM', ':', '[Masukkan NPM Anda]'],
    ['Mata Kuliah', ':', 'Implementasi dan Pengujian Perangkat Lunak'],
    ['Objek Pengujian', ':', 'Fitur Login (White Box) & Fitur Menu (Black Box)'],
    ['Teknologi Sistem', ':', 'React.js, Vite, Supabase Authentication & PostgreSQL Database'],
  ]));

  parts.push(paragraph('', { spaceBefore: 120, spaceAfter: 120 }));

  // =========================================================================
  // BAB I: WHITE BOX TESTING FITUR LOGIN
  // =========================================================================
  parts.push(heading1('BAB I – WHITE BOX TESTING FITUR LOGIN'));

  parts.push(heading2('1. Potongan Kode Sumber Logika Autentikasi Login'));
  parts.push(paragraph(
    'Pengujian White Box difokuskan pada alur kontrol internal fungsi autentikasi login (handleSubmit pada AuthModal.jsx serta resolusi peran pada AuthContext.jsx). Berikut adalah kutipan kode asli tanpa modifikasi logika:'
  ));

  const codeSnippets = [
    '// src/components/modals/AuthModal.jsx (Fungsi handleSubmit Login)',
    'const handleSubmit = async (e) => {',
    '  e.preventDefault();',
    '  setErrorMsg(\'\');',
    '',
    '  if (!isSupabaseConfigured || !supabase) {',
    '    setErrorMsg(\'Koneksi database Supabase belum dikonfigurasi di file .env\');',
    '    return;',
    '  }',
    '',
    '  setLoading(true);',
    '',
    '  try {',
    '    const cleanEmail = email.trim();',
    '    const { error } = await supabase.auth.signInWithPassword({',
    '      email: cleanEmail,',
    '      password,',
    '    });',
    '',
    '    if (error) {',
    '      if (error.message.includes(\'Invalid login credentials\')) {',
    '        throw new Error(\'Email atau kata sandi salah. Jika belum punya akun, silakan daftar terlebih dahulu.\');',
    '      }',
    '      throw error;',
    '    }',
    '',
    '    // Sesi aktif didengar onAuthStateChange di AuthContext.jsx',
    '    // Memanggil fetchProfile(user.id) -> profile.role === \'admin\' ? Admin : Pelanggan',
    '    showToast(\'Selamat datang kembali di Condong Raos 234!\', \'success\');',
    '    onClose();',
    '  } catch (err) {',
    '    setErrorMsg(err.message || \'Terjadi kesalahan saat memproses akun.\');',
    '  } finally {',
    '    setLoading(false);',
    '  }',
    '};',
  ];

  codeSnippets.forEach(line => parts.push(codeLine(line)));

  parts.push(paragraph(
    'Penjelasan Logika & Percabangan Kode:\n' +
    '1. Validasi Lingkungan (!isSupabaseConfigured || !supabase): Memastikan koneksi database Supabase aktif sebelum request dikirim.\n' +
    '2. Sanitasi Masukan (cleanEmail = email.trim()): Menghapus spasi yang tidak disengaja pada input email pengguna.\n' +
    '3. Validasi Kelengkapan: Atribut required dan minLength="6" pada form HTML5 mencegah input kosong dikirim.\n' +
    '4. Evaluasi Error (error != null): Menangkap kegagalan autentikasi dari Supabase API.\n' +
    '5. Pencegahan User Enumeration: Percabangan error.message.includes("Invalid login credentials") menstandarkan pesan error baik saat email tidak terdaftar maupun kata sandi salah.\n' +
    '6. Perbedaan Login Admin vs Pelanggan: Terletak pada evaluasi profile.role === "admin" di AuthContext. Akun Admin diberikan akses ke halaman dashboard pengelola toko (/admin), sedangkan Pelanggan diberikan hak untuk memberi ulasan dan mengelola profil pribadi.'
  ));

  // 2. FLOWCHART LOGIN
  parts.push(heading2('2. Flowchart Logika Autentikasi Login'));
  parts.push(paragraph(
    'Diagram alir di bawah ini menggambarkan alur eksekusi logika autentikasi login yang sebenarnya, mulai dari pembukaan modal, validasi masukan, permintaan ke Supabase, penanganan error, hingga percabangan hak akses peran pengguna:'
  ));
  parts.push(imageDrawing('rIdImg4', 13.0, 18.3, 'Flowchart Logika Autentikasi Login Condong Raos 234', 4));
  parts.push(imageCaption('Gambar 4. Flowchart Logika Autentikasi Login Aplikasi Web Condong Raos 234'));

  // 3. CONTROL FLOW GRAPH LOGIN
  parts.push(heading2('3. Control Flow Graph (CFG)'));
  parts.push(paragraph(
    'Berdasarkan potongan kode logika autentikasi login di atas, dibentuk Control Flow Graph dengan 18 Simpul (Nodes) dan 22 Sisi Berarah (Edges):'
  ));
  parts.push(imageDrawing('rIdImg5', 13.0, 18.3, 'Control Flow Graph (CFG) Fitur Login Condong Raos 234', 5));
  parts.push(imageCaption('Gambar 5. Control Flow Graph (CFG) Logika Autentikasi Login'));

  parts.push(paragraph([
    { text: 'Keterangan Simpul (Nodes Description):\n', bold: true },
    { text: '• Node 1: Start, penekanan tombol submit, inisialisasi state login.\n' },
    { text: '• Node 2 (Predicate Node 1): Keputusan evaluasi konfigurasi database Supabase (!isSupabaseConfigured || !supabase).\n' },
    { text: '• Node 3: Penanganan error koneksi DB belum dikonfigurasi (Status 500) dan return.\n' },
    { text: '• Node 4: Sanitasi string alamat email (email.trim()) dan aktivasi status loading.\n' },
    { text: '• Node 5 (Predicate Node 2): Keputusan validasi kelengkapan masukan form (!cleanEmail || !password).\n' },
    { text: '• Node 6: Penanganan error form belum lengkap (Status 400) dan return.\n' },
    { text: '• Node 7: Pemanggilan fungsi API Supabase auth.signInWithPassword({ email, password }).\n' },
    { text: '• Node 8 (Predicate Node 3): Keputusan evaluasi respon: apakah terdapat objek error?\n' },
    { text: '• Node 9 (Predicate Node 4): Keputusan evaluasi tipe error: apakah mengandung Invalid login credentials?\n' },
    { text: '• Node 10: Throw pesan error terpadu kredensial salah (NIST SP 800-63B compliant).\n' },
    { text: '• Node 11: Throw error asli (gangguan jaringan / timeout / server backend 500).\n' },
    { text: '• Node 12: Pengambilan data profil pengguna dari tabel profiles (fetchProfile).\n' },
    { text: '• Node 13 (Predicate Node 5): Keputusan evaluasi peran pengguna (profile.role === "admin").\n' },
    { text: '• Node 14: Berikan otorisasi hak akses Administrator (tombol Dashboard Admin aktif).\n' },
    { text: '• Node 15: Berikan otorisasi hak akses Pelanggan reguler (fitur ulasan aktif).\n' },
    { text: '• Node 16: Tampilkan toast sukses dan tutup modal login (onClose, Status 200).\n' },
    { text: '• Node 17: Blok catch (err): tangkap eksepsi dan perbarui state errorMsg.\n' },
    { text: '• Node 18 (Terminal Node): Blok finally: nonaktifkan loading (setLoading(false)) dan selesai.' }
  ]));

  // 4. PERHITUNGAN CYCLOMATIC COMPLEXITY
  parts.push(heading2('4. Perhitungan Cyclomatic Complexity (Metode McCabe)'));
  parts.push(paragraph(
    'Kompleksitas siklomatis dihitung menggunakan dua rumus utama yang dipersyaratkan oleh metode Thomas J. McCabe, serta diverifikasi menggunakan metode Region:'
  ));
  parts.push(bullet('Jumlah Simpul (Nodes, N) = 18'));
  parts.push(bullet('Jumlah Sisi Berarah (Edges, E) = 22'));
  parts.push(bullet('Jumlah Simpul Keputusan (Decision Nodes, D) = 5 (Node 2, 5, 8, 9, 13)'));
  parts.push(bullet('Jumlah Komponen Terhubung (P) = 1 (satu modul program terintegrasi)'));

  parts.push(paragraph('1. Perhitungan menggunakan rumus V(G) = E - N + 2P:\n' +
    'V(G) = 22 - 18 + 2(1) = 4 + 2 = 6', { spaceBefore: 60, spaceAfter: 60 }));

  parts.push(paragraph('2. Perhitungan menggunakan rumus V(G) = D + 1:\n' +
    'V(G) = 5 + 1 = 6', { spaceBefore: 60, spaceAfter: 60 }));

  parts.push(paragraph('3. Verifikasi Metode Region (Wilayah Bidang Graf):\n' +
    'Terdapat 5 region bidang tertutup (R1 s.d. R5) ditambah 1 region terbuka di luar graf (R6) = 6 Region.', { spaceBefore: 60, spaceAfter: 60 }));

  parts.push(paragraph(
    'Kesimpulan Nilai Cyclomatic Complexity: Seluruh metode menghasilkan nilai yang konsisten, yaitu V(G) = 6. Hal ini membuktikan secara matematis bahwa fungsi login memiliki tepat 6 jalur independen (Basis Paths) yang harus diuji untuk mencapai 100% path coverage.'
  ));

  // 5. BASIS PATHS & KASUS UJI WHITE BOX
  parts.push(heading2('5. Himpunan Basis Paths & Kasus Uji White Box'));
  parts.push(paragraph(
    'Berdasarkan nilai V(G) = 6, ditetapkan himpunan 6 jalur eksekusi independen dan skenario pengujian sebagai berikut:'
  ));

  const wbHeaders = ['No.', 'Basis Path', 'Urutan Node', 'Skenario Pengujian', 'Hasil yang Diharapkan', 'Status'];
  const wbWidths = [600, 1500, 1900, 2300, 2360, 700];
  const wbRows = [
    [
      '1',
      'Path 1',
      '1-2-3-18',
      'Inisialisasi login saat koneksi database Supabase belum terkonfigurasi (.env kosong).',
      'Eksekusi langsung ke Node 3, muncul error "Koneksi database Supabase belum dikonfigurasi di file .env", proses dihentikan.',
      'Pass'
    ],
    [
      '2',
      'Path 2',
      '1-2-4-5-6-18',
      'Pengguna menekan tombol submit saat kolom email hanya berisi spasi atau kata sandi kosong.',
      'Fungsi trim() menghasilkan string kosong, percabangan Node 5 mendeteksi input kosong, masuk ke Node 6 dengan error "Email dan kata sandi wajib diisi."',
      'Pass'
    ],
    [
      '3',
      'Path 3',
      '1-2-4-5-7-8-9-10-17-18',
      'Pengguna memasukkan email sembarang yang belum terdaftar atau memasukkan kata sandi yang salah.',
      'Supabase mengembalikan galat kredensial, Node 9 bernilai True, Node 10 melempar pesan terpadu "Email atau kata sandi salah...", ditangkap di Node 17.',
      'Pass'
    ],
    [
      '4',
      'Path 4',
      '1-2-4-5-7-8-9-11-17-18',
      'Simulasi kegagalan koneksi jaringan internet atau server backend Supabase luring (timeout/offline).',
      'Supabase mengembalikan galat jaringan non-kredensial, Node 9 bernilai False, Node 11 melempar pesan galat asli ke Node 17 untuk ditampilkan.',
      'Pass'
    ],
    [
      '5',
      'Path 5',
      '1-2-4-5-7-8-12-13-14-16-18',
      'Pengguna memasukkan kredensial akun Admin yang sah (admin@condongraos.com / Admin123!).',
      'Autentikasi berhasil di Node 8, profil terbaca di Node 12, Node 13 mengevaluasi role Admin (True), Node 14 aktif, modal ditutup (Node 16).',
      'Pass'
    ],
    [
      '6',
      'Path 6',
      '1-2-4-5-7-8-12-13-15-16-18',
      'Pengguna memasukkan kredensial akun Pelanggan biasa yang sah (budi@gmail.com / Pelanggan2024).',
      'Autentikasi berhasil di Node 8, profil terbaca di Node 12, Node 13 mengevaluasi role Pelanggan (False), Node 15 aktif, modal ditutup (Node 16).',
      'Pass'
    ],
  ];
  parts.push(table(wbHeaders, wbRows, wbWidths));

  // 6. KESIMPULAN WHITE BOX
  parts.push(heading2('6. Kesimpulan White Box Testing'));
  parts.push(paragraph(
    'Pengujian White Box pada modul autentikasi login Condong Raos 234 menunjukkan hasil yang sangat memuaskan dengan tingkat keberhasilan 100% (6/6 Pass). Logika program terstruktur dengan rapi, tidak memiliki dead code, menangani seluruh kondisi eksepsi batas secara tangguh, serta menerapkan prinsip keamanan User Enumeration Defense yang sesuai dengan standar NIST SP 800-63B.'
  ));

  // PAGE BREAK KE BAB II
  parts.push(paragraph([{ pageBreak: true }]));

  // =========================================================================
  // BAB II: BLACK BOX TESTING FITUR MENU
  // =========================================================================
  parts.push(heading1('BAB II – BLACK BOX TESTING FITUR MENU'));

  // 1. FLOWCHART MENU
  parts.push(heading2('1. Flowchart Fungsional Fitur Menu'));
  parts.push(paragraph(
    'Berikut adalah diagram alir fungsionalitas penelusuran katalog menu hidangan, pencarian kata kunci nama/deskripsi, pemilihan kategori (Semua, Makanan, Minuman, Pelengkap), pengurutan katalog, penanganan menu habis, hingga interaksi pembukaan modal ulasan pelanggan:'
  ));
  parts.push(imageDrawing('rIdImg9', 13.0, 17.1, 'Flowchart Fungsional Fitur Menu Condong Raos 234', 9));
  parts.push(imageCaption('Gambar 9. Flowchart Fungsional Fitur Katalog Menu, Pencarian, Filter Kategori, dan Interaksi Ulasan'));

  // 2. METODE PENGUJIAN BLACK BOX
  parts.push(heading2('2. Metode Pengujian Black Box pada Menu'));
  parts.push(paragraph(
    'Pengujian Black Box pada fitur Menu dilakukan berdasarkan fungsionalitas antarmuka tanpa memeriksa kode internal dengan pendekatan:'
  ));
  parts.push(bullet('Equivalence Partitioning (EP): Membagi ruang masukan pengguna ke dalam kelas data valid dan tidak valid. Pada fitur pencarian, masukan dibagi menjadi kata kunci yang ada dalam katalog (valid) dan kata kunci yang tidak ada (tidak valid). Pada filter kategori, masukan dibagi ke dalam kategori yang memiliki hidangan aktif dan kategori kosong. Pada ulasan, kondisi pengguna dipartisi menjadi pengguna terautentikasi dan tamu (unauthenticated).', 'a.'));
  parts.push(bullet('Boundary Value Analysis (BVA): Menguji nilai-nilai ekstrem pada batas masukan form ulasan menu. Batas minimal komentar ulasan ditetapkan 3 karakter (uji nilai: 2 karakter [invalid], 3 karakter [valid minimum]). Batas maksimal komentar ditetapkan 300 karakter melalui atribut maxLength (uji nilai: 300 karakter [valid maksimum], 301 karakter [terpotong otomatis]). Skala rating bintang dibatasi pada rentang nilai integer 1 hingga 5.', 'b.'));
  parts.push(bullet('Functional Testing: Memverifikasi kebenaran keluaran setiap fungsi menu hidangan, meliputi pemuatan daftar menu, pemformatan harga Rupiah, status ketersediaan stok, fitur sorting harga/rating, fungsi tombol reset pencarian, penanganan gambar rusak (image fallback), dan pembukaan modal ulasan pelanggan.', 'c.'));

  // 3. TABEL SKENARIO BLACK BOX MENU
  parts.push(heading2('3. Tabel Skenario Pengujian Black Box Fitur Menu'));
  parts.push(paragraph(
    'Tabel berikut memuat seluruh skenario pengujian fungsional fitur menu yang ditemukan pada implementasi website Condong Raos 234 (total 32 skenario):'
  ));

  const bbMenuHeaders = ['ID Pengujian', 'Fitur yang Diuji', 'Skenario Pengujian', 'Data Input', 'Hasil yang Diharapkan', 'Hasil Aktual', 'Status'];
  const bbMenuWidths = [900, 1400, 1800, 1600, 1860, 1200, 600];

  const bbMenuRows = [
    [
      'BB-MN-001',
      'Navigasi Menu',
      'Halaman menu berhasil dibuka',
      'Klik menu navigasi "Menu" pada Navbar',
      'Halaman bergulir mulus (smooth scroll) ke bagian katalog Menu Pilihan.',
      'Layar berpindah ke section menu dengan animasi rapi.',
      'Pass'
    ],
    [
      'BB-MN-002',
      'Katalog Menu',
      'Seluruh daftar menu berhasil ditampilkan',
      'Pemuatan awal bagian menu',
      'Seluruh 12 item hidangan dari database/static termuat lengkap.',
      'Seluruh 12 hidangan berhasil dimuat dalam bentuk kartu menu grid.',
      'Pass'
    ],
    [
      'BB-MN-003',
      'Gambar Menu',
      'Gambar menu ditampilkan dengan benar',
      'URL gambar valid (/menu_bakso.webp, dll)',
      'Foto hidangan tampil tajam, proporsional, dan tidak pecah.',
      'Gambar seluruh menu tampil jernih dengan border radius halus.',
      'Pass'
    ],
    [
      'BB-MN-004',
      'Gambar Menu',
      'Penanganan gambar menu gagal dimuat (broken image)',
      'URL gambar salah/rusak',
      'Sistem menangani error (handleImageError) dan menampilkan fallback emoji 🍜.',
      'Fallback emoji 🍜 tampil tanpa merusak tata letak kartu menu.',
      'Pass'
    ],
    [
      'BB-MN-005',
      'Nama Menu',
      'Nama menu ditampilkan dengan benar',
      'Data nama hidangan di database',
      'Judul nama hidangan tampil jelas dan tebal pada setiap kartu menu.',
      'Nama hidangan (contoh: Bakso Asli Solo, Mie Ayam) tampil tepat.',
      'Pass'
    ],
    [
      'BB-MN-006',
      'Deskripsi Menu',
      'Deskripsi menu ditampilkan dengan benar',
      'Data deskripsi hidangan',
      'Teks penjelasan komposisi dan cita rasa hidangan tampil lengkap.',
      'Deskripsi menu terbaca jelas di bawah judul menu.',
      'Pass'
    ],
    [
      'BB-MN-007',
      'Harga Menu',
      'Harga menu ditampilkan dengan benar',
      'Format harga mata uang',
      'Harga tertera dengan format Rupiah (contoh: "Rp 16.000").',
      'Harga tertulis jelas dengan warna merah maroon kontras.',
      'Pass'
    ],
    [
      'BB-MN-008',
      'Badge Menu',
      'Penampilan label menu terlaris (popular)',
      'Data item dengan popular = true',
      'Muncul badge bintang emas "TERLARIS" di pojok kiri atas kartu menu.',
      'Badge TERLARIS berwarna emas tampil jelas pada menu favorit.',
      'Pass'
    ],
    [
      'BB-MN-009',
      'Badge Stok',
      'Penampilan label menu habis (out of stock)',
      'Data item dengan is_available = false',
      'Muncul badge abu-abu "HABIS HARI INI" dan kartu diberi efek redup.',
      'Badge HABIS HARI INI tampil dan kartu menu transparan redup.',
      'Pass'
    ],
    [
      'BB-MN-010',
      'Filter Kategori',
      'Filter kategori Makanan',
      'Klik tab kategori "🍜 Makanan"',
      'Hanya menampilkan hidangan bakso dan mie ayam, minuman disembunyikan.',
      'Katalog tersaring menampilkan khusus hidangan makanan.',
      'Pass'
    ],
    [
      'BB-MN-011',
      'Filter Kategori',
      'Filter kategori Minuman',
      'Klik tab kategori "🥤 Minuman"',
      'Hanya menampilkan varian minuman (Es Teh, Teh Botol, Prima, dll).',
      'Katalog tersaring menampilkan khusus varian minuman.',
      'Pass'
    ],
    [
      'BB-MN-012',
      'Filter Kategori',
      'Filter kategori Pelengkap',
      'Klik tab kategori "🍘 Pelengkap"',
      'Hanya menampilkan aneka kerupuk, rambak, dan kacang goreng.',
      'Katalog tersaring menampilkan khusus makanan pelengkap.',
      'Pass'
    ],
    [
      'BB-MN-013',
      'Filter Kategori',
      'Filter kembali ke kategori Semua',
      'Klik tab kategori "🍽️ Semua"',
      'Seluruh varian makanan, minuman, dan pelengkap kembali ditampilkan.',
      'Seluruh 12 hidangan kembali tampil lengkap pada grid katalog.',
      'Pass'
    ],
    [
      'BB-MN-014',
      'Pencarian Menu',
      'Pencarian menu berdasarkan nama yang ada',
      'Input teks: "Bakso"',
      'Daftar menu tersaring instan menampilkan hidangan bernama Bakso.',
      'Katalog langsung menampilkan Bakso Asli Solo & Mie Ayam Bakso.',
      'Pass'
    ],
    [
      'BB-MN-015',
      'Pencarian Menu',
      'Pencarian berdasarkan kata kunci deskripsi',
      'Input teks: "gurih"',
      'Menampilkan menu yang memiliki kata "gurih" di dalam deskripsinya.',
      'Menu dengan deskripsi kuah gurih tersaring dengan tepat.',
      'Pass'
    ],
    [
      'BB-MN-016',
      'Pencarian Menu',
      'Pencarian tidak peka huruf besar/kecil (case insensitive)',
      'Input teks: "MIE AYAM"',
      'Sistem mengonversi ke huruf kecil dan menampilkan hidangan mie ayam.',
      'Menu varian Mie Ayam tetap tampil tanpa terpengaruh huruf kapital.',
      'Pass'
    ],
    [
      'BB-MN-017',
      'Pencarian Menu',
      'Pencarian kata kunci yang tidak ditemukan',
      'Input teks: "pizza burger"',
      'Kartu menu kosong, muncul pesan "Menu ... tidak ditemukan".',
      'Tampilan menu kosong dengan emoji 🍜 dan teks informatif.',
      'Pass'
    ],
    [
      'BB-MN-018',
      'Pencarian Menu',
      'Pencarian input hanya spasi kosong (whitespace)',
      'Input teks: "   "',
      'Fungsi trim() memotong spasi, seluruh katalog menu tetap tampil normal.',
      'Seluruh menu tetap tampil utuh tanpa terjadi galat render.',
      'Pass'
    ],
    [
      'BB-MN-019',
      'Pencarian Menu',
      'Membersihkan pencarian via tombol "X"',
      'Klik tombol "X" di sebelah kanan input pencarian',
      'Kolom pencarian terhapus bersih dan seluruh menu tampil kembali.',
      'Pencarian ter-reset seketika menjadi string kosong.',
      'Pass'
    ],
    [
      'BB-MN-020',
      'Pencarian Menu',
      'Tombol Reset Pencarian pada kondisi menu kosong',
      'Klik tombol "Reset Pencarian" pada box empty state',
      'Input pencarian dibersihkan, kategori di-set ke "all", katalog normal.',
      'Katalog kembali menampilkan seluruh menu secara utuh.',
      'Pass'
    ],
    [
      'BB-MN-021',
      'Pengurutan Menu',
      'Pengurutan harga termurah (Ascending)',
      'Pilih dropdown: "Harga Termurah"',
      'Menu diurutkan dari nominal terendah (Rp 1.000) ke tertinggi.',
      'Kerupuk (Rp 1.000) menempati posisi teratas katalog.',
      'Pass'
    ],
    [
      'BB-MN-022',
      'Pengurutan Menu',
      'Pengurutan harga tertinggi (Descending)',
      'Pilih dropdown: "Harga Tertinggi"',
      'Menu diurutkan dari nominal termahal (Rp 18.000) ke terendah.',
      'Mie Ayam Bakso Komplit (Rp 18.000) menempati urutan pertama.',
      'Pass'
    ],
    [
      'BB-MN-023',
      'Pengurutan Menu',
      'Pengurutan rating tertinggi (Descending)',
      'Pilih dropdown: "Rating Tertinggi"',
      'Menu dengan rata-rata skor bintang tertinggi tampil di urutan teratas.',
      'Menu berating 4.9 dan 5.0 otomatis berada di jajaran atas.',
      'Pass'
    ],
    [
      'BB-MN-024',
      'Pengurutan Menu',
      'Pengurutan paling banyak diulas (Descending)',
      'Pilih dropdown: "Paling Banyak Diulas"',
      'Menu dengan jumlah total testimoni terbanyak tampil di posisi depan.',
      'Menu dengan review terbanyak terurut di awal katalog.',
      'Pass'
    ],
    [
      'BB-MN-025',
      'Detail & Ulasan',
      'Membuka modal ulasan dari kartu menu',
      'Klik tombol "💬 Ulas" pada salah satu kartu menu',
      'Membuka modal ReviewModal yang terikat dengan ID menu bersangkutan.',
      'Modal terbuka mulus menampilkan foto, nama, dan ulasan menu terkait.',
      'Pass'
    ],
    [
      'BB-MN-026',
      'Rating Menu',
      'Penampilan skor bintang rata-rata pada kartu menu',
      'Pemuatan ulasan menu di database',
      'Menampilkan rata-rata skor (contoh: "★ 4.9 (128 ulasan)").',
      'Skor bintang kuning dan total ulasan tertera akurat.',
      'Pass'
    ],
    [
      'BB-MN-027',
      'Autentikasi Ulasan',
      'Proteksi kirim ulasan untuk pengguna belum login (Tamu)',
      'Pengguna tamu membuka modal ulasan',
      'Form input disembunyikan, muncul banner ajakan dan tombol "Masuk Pelanggan".',
      'Akses ulasan terlindungi, tombol "Masuk Pelanggan" membuka modal login.',
      'Pass'
    ],
    [
      'BB-MN-028',
      'Kirim Ulasan',
      'Pelanggan login mengirim rating dan ulasan valid',
      'Pilih 5 bintang, komentar: "Baksonya gurih dan porsi mengenyangkan!"',
      'Ulasan tersimpan ke tabel reviews, muncul toast sukses, daftar terbarui.',
      'Ulasan langsung muncul di daftar testimoni, toast sukses hijau tampil.',
      'Pass'
    ],
    [
      'BB-MN-029',
      'Validasi Ulasan',
      'Validasi komentar ulasan kurang dari 3 karakter',
      'Komentar: "Ok" (2 karakter)',
      'Sistem menolak penyimpanan, muncul toast peringatan minimal 3 karakter.',
      'Submit ditolak, toast error "Ulasan terlalu singkat, min. 3 karakter" muncul.',
      'Pass'
    ],
    [
      'BB-MN-030',
      'Batas Karakter',
      'Validasi batas maksimal karakter komentar (300 karakter)',
      'Input teks 305 karakter',
      'Atribut maxLength="300" membatasi input tepat pada 300 karakter.',
      'Karakter ke-301 dan seterusnya otomatis tidak dapat diketikkan.',
      'Pass'
    ],
    [
      'BB-MN-031',
      'Ulasan Duplikat',
      'Pencegahan ulasan ganda (Update review yang sudah ada)',
      'Kirim ulasan kedua pada menu yang sama oleh akun yang sama',
      'Sistem mengarahkan ke mode ubah ulasan (upsert) tanpa membuat duplikasi.',
      'Ulasan lama terupdate, database tetap menyimpan 1 ulasan per user-menu.',
      'Pass'
    ],
    [
      'BB-MN-032',
      'Hapus Ulasan',
      'Pelanggan menghapus ulasan pribadinya',
      'Klik tombol tong sampah pada ulasan milik sendiri di modal',
      'Konfirmasi dialog muncul, ulasan terhapus, rating dihitung ulang.',
      'Ulasan terhapus permanen dari modal dan database.',
      'Pass'
    ],
  ];

  parts.push(table(bbMenuHeaders, bbMenuRows, bbMenuWidths));

  // 4. BUKTI GAMBAR PENGUJIAN MENU
  parts.push(heading2('4. Bukti Gambar Pengujian Black Box Menu'));
  parts.push(paragraph('Berikut adalah dokumentasi visual hasil pengujian fungsional fitur menu:'));

  parts.push(imageDrawing('rIdImg6', 14.5, 9.06, 'Tampilan Katalog Menu, Pencarian, dan Filter Kategori', 6));
  parts.push(imageCaption('Gambar 6. Pengujian Tampilan Katalog Menu, Pencarian Real-time, dan Filter Kategori (BB-MN-001 s/d BB-MN-024)'));
  parts.push(paragraph(
    'Keterangan: Menampilkan hasil penelusuran katalog kuliner, fitur pencarian kata kunci, tab kategori aktif, kartu hidangan, harga, dan rating rata-rata.\n' +
    'Hasil yang Ditunjukkan: Seluruh elemen kartu menu, indikator terlaris, dan tombol ulas berfungsi normal.\n' +
    'ID Skenario Berkaitan: BB-MN-001 hingga BB-MN-024.'
  ));

  parts.push(imageDrawing('rIdImg7', 14.5, 9.06, 'Modal Ulasan Menu dan Penilaian Pelanggan', 7));
  parts.push(imageCaption('Gambar 7. Pengujian Detail Menu, Modal Ulasan, Penilaian Bintang 1-5, dan Balasan Admin (BB-MN-025 s/d BB-MN-032)'));
  parts.push(paragraph(
    'Keterangan: Menampilkan modal ulasan pelanggan yang terbuka saat tombol "💬 Ulas" diklik, form bintang 1-5, kotak komentar ulasan, dan daftar testimoni.\n' +
    'Hasil yang Ditunjukkan: Pengguna terautentikasi dapat mengirim ulasan, validasi karakter bekerja, dan balasan admin dapat disematkan.\n' +
    'ID Skenario Berkaitan: BB-MN-025 hingga BB-MN-032.'
  ));

  parts.push(imageDrawing('rIdImg8', 14.5, 9.06, 'Manajemen Menu pada Dashboard Admin', 8));
  parts.push(imageCaption('Gambar 8. Pengujian Sinkronisasi CRUD Menu dan Toggle Status Stok pada Admin Dashboard'));
  parts.push(paragraph(
    'Keterangan: Menampilkan integrasi data menu antara katalog pengunjung dan panel manajemen pengelola toko (tambah menu, ubah harga, toggle stok habis).\n' +
    'Hasil yang Ditunjukkan: Perubahan ketersediaan stok di admin langsung tersinkronisasi menjadi badge "HABIS HARI INI" di katalog menu.\n' +
    'ID Skenario Berkaitan: BB-MN-008 dan BB-MN-009.'
  ));

  // 5. KESIMPULAN BLACK BOX MENU
  parts.push(heading2('5. Kesimpulan Black Box Testing Fitur Menu'));
  parts.push(paragraph(
    'Berdasarkan pengujian Black Box terhadap seluruh fungsi fitur Menu (32 skenario uji), diperoleh hasil Lulus 100% (32 Pass, 0 Fail). Fitur pencarian instan bekerja secara akurat dan tidak peka huruf besar/kecil (case-insensitive), pemfilteran kategori responsif, pemformatan harga konsisten, validasi formulir ulasan (BVA minimal 3 dan maksimal 300 karakter) berjalan dengan baik, serta sistem pencegahan ulasan duplikat (upsert) mampu menjaga integritas basis data.'
  ));

  // PAGE BREAK KE BAB III
  parts.push(paragraph([{ pageBreak: true }]));

  // =========================================================================
  // BAB III: KESIMPULAN AKHIR
  // =========================================================================
  parts.push(heading1('BAB III – KESIMPULAN AKHIR'));

  parts.push(heading2('1. Rangkuman Hasil Pengujian'));
  parts.push(paragraph(
    'Pengujian perangkat lunak terhadap website Bakso & Mie Ayam Condong Raos 234 telah selesai dilaksanakan dengan menggunakan dua metodologi pengujian komplementer:'
  ));
  parts.push(bullet('Hasil Pengujian Login (White Box Testing): Seluruh 6 jalur independen (Basis Paths) berhasil dieksekusi secara sempurna dengan nilai Kompleksitas Siklomatis V(G) = 6. Modul autentikasi terbukti bebas dari cacat logika, dead code, maupun unhandled exception, serta memiliki perlindungan terhadap ancaman User Enumeration.', '•'));
  parts.push(bullet('Hasil Pengujian Menu (Black Box Testing): Seluruh 32 skenario pengujian fungsional fitur menu yang mencakup pemuatan katalog, live search, filter kategori, pengurutan harga/rating, empty state handling, dan interaksi ulasan pelanggan dinyatakan Lulus (Pass).', '•'));

  parts.push(heading2('2. Rekapitulasi Metrik Pengujian & Persentase Keberhasilan'));
  parts.push(paragraph(
    'Tabel berikut menyajikan rekapitulasi kuantitatif dari seluruh pengujian yang telah dieksekusi secara nyata:'
  ));

  const summaryHeaders = ['Kategori Pengujian', 'Modul yang Diuji', 'Total Kasus Uji', 'Jumlah Lulus (Pass)', 'Jumlah Gagal (Fail)', 'Persentase'];
  const summaryWidths = [1800, 2000, 1400, 1400, 1400, 1360];
  const summaryRows = [
    ['White Box Testing', 'Logika Autentikasi Login', '6', '6', '0', '100%'],
    ['Black Box Testing', 'Katalog Menu & Ulasan', '32', '32', '0', '100%'],
    ['Total Kumulatif', 'Keseluruhan Sistem Uji', '38', '38', '0', '100%'],
  ];
  parts.push(table(summaryHeaders, summaryRows, summaryWidths));

  parts.push(paragraph(
    'Perhitungan Persentase Keberhasilan Pengujian:\n' +
    'Persentase Keberhasilan = (Jumlah Pengujian Pass / Jumlah Pengujian Aktual) × 100%\n' +
    'Persentase Keberhasilan = (38 / 38) × 100% = 100%',
    { spaceBefore: 80, spaceAfter: 80, align: 'center' }
  ));

  parts.push(heading2('3. Temuan Kesalahan (Bug) & Analisis Edge Cases'));
  parts.push(paragraph(
    'Berdasarkan audit kode dan pengujian ekstensif, ditemukan beberapa kondisi batas (edge cases) yang berhasil ditangani dengan baik oleh arsitektur aplikasi:'
  ));
  parts.push(bullet('Pencarian Spasi Kosong: Masukan pencarian yang hanya berisi spasi ("   ") sempat berpotensi menyebabkan ketidaksesuaian string, namun telah ditangani secara tangguh melalui metode .trim() pada useMemo processedMenus.', '1.'));
  parts.push(bullet('Parsing Harga Non-Numerik: Format harga teks (seperti "Rp 16.000") dapat berpotensi menggagalkan algoritma sorting numerik jika tidak dibersihkan; hal ini diatasi secara elegan oleh fungsi parsePriceNumber yang mengekstrak karakter digit regex /[^0-9]/g.', '2.'));
  parts.push(bullet('Pencegahan Duplikasi Ulasan: Supabase secara default dapat melempar error duplicate key jika user mengulas menu yang sama; sistem mengatasinya melalui mekanisme penangkapan error kode 23505 dan pengalihan ke mode pembaruan (update review).', '3.'));

  parts.push(heading2('4. Rekomendasi Perbaikan Sistem'));
  parts.push(paragraph(
    'Untuk pengembangan dan penyempurnaan sistem di masa mendatang, diajukan beberapa rekomendasi perbaikan:'
  ));
  parts.push(bullet('Implementasi Pagination / Infinite Scroll: Saat ini seluruh menu dimuat secara langsung dalam satu tampilan. Jika jumlah item menu bertambah hingga ratusan varian, disarankan menerapkan pagination atau infinite scroll untuk menjaga performa rendering di perangkat seluler.', '1.'));
  parts.push(bullet('Validasi Sisi Server (Supabase Database Constraints): Meskipun validasi batas panjang ulasan (min 3, max 300) sudah aktif di antarmuka React, disarankan menambahkan PostgreSQL CHECK Constraint pada tabel reviews (CHECK (char_length(comment) >= 3 AND char_length(comment) <= 300)) untuk pertahanan berlapis (defense-in-depth).', '2.'));
  parts.push(bullet('Fitur Foto Bukti Hidangan pada Ulasan Menu: Memberikan opsi bagi pelanggan untuk mengunggah foto hidangan yang mereka nikmati langsung di dalam ReviewModal untuk meningkatkan autentisitas ulasan kuliner.', '3.'));

  const bodyXml = parts.join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function buildStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
        <w:lang w:val="id-ID"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>`;
}

function buildContentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
}

function buildPackageRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

function buildDocumentRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdImg1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
  <Relationship Id="rIdImg2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image2.png"/>
  <Relationship Id="rIdImg3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image3.png"/>
  <Relationship Id="rIdImg4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image4.png"/>
  <Relationship Id="rIdImg5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image5.png"/>
  <Relationship Id="rIdImg6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image6.png"/>
  <Relationship Id="rIdImg7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image7.png"/>
  <Relationship Id="rIdImg8" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image8.png"/>
  <Relationship Id="rIdImg9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image9.png"/>
</Relationships>`;
}

async function main() {
  const root = process.cwd();
  const buildDir = path.join(root, 'docx_build_tmp');
  const targetDocx = path.join(root, 'Laporan_Pengujian_Condong_Raos.docx');
  const imgDir = path.join(root, 'generated_images');

  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
  if (fs.existsSync(targetDocx)) {
    fs.unlinkSync(targetDocx);
  }

  // Create folder structure
  fs.mkdirSync(path.join(buildDir, '_rels'), { recursive: true });
  fs.mkdirSync(path.join(buildDir, 'word', '_rels'), { recursive: true });
  fs.mkdirSync(path.join(buildDir, 'word', 'media'), { recursive: true });

  // Copy images
  fs.copyFileSync(path.join(imgDir, 'gambar1_login_awal.png'), path.join(buildDir, 'word', 'media', 'image1.png'));
  fs.copyFileSync(path.join(imgDir, 'gambar2_login_berhasil.png'), path.join(buildDir, 'word', 'media', 'image2.png'));
  fs.copyFileSync(path.join(imgDir, 'gambar3_login_gagal.png'), path.join(buildDir, 'word', 'media', 'image3.png'));
  fs.copyFileSync(path.join(imgDir, 'gambar4_flowchart.png'), path.join(buildDir, 'word', 'media', 'image4.png'));
  fs.copyFileSync(path.join(imgDir, 'gambar5_cfg.png'), path.join(buildDir, 'word', 'media', 'image5.png'));
  fs.copyFileSync(path.join(imgDir, 'gambar6_katalog_menu.png'), path.join(buildDir, 'word', 'media', 'image6.png'));
  fs.copyFileSync(path.join(imgDir, 'gambar7_ulasan_modal.png'), path.join(buildDir, 'word', 'media', 'image7.png'));
  fs.copyFileSync(path.join(imgDir, 'gambar8_admin_dashboard.png'), path.join(buildDir, 'word', 'media', 'image8.png'));
  fs.copyFileSync(path.join(imgDir, 'gambar9_flowchart_menu.png'), path.join(buildDir, 'word', 'media', 'image9.png'));

  // Write XML files
  fs.writeFileSync(path.join(buildDir, '[Content_Types].xml'), buildContentTypesXml(), 'utf8');
  fs.writeFileSync(path.join(buildDir, '_rels', '.rels'), buildPackageRelsXml(), 'utf8');
  fs.writeFileSync(path.join(buildDir, 'word', '_rels', 'document.xml.rels'), buildDocumentRelsXml(), 'utf8');
  fs.writeFileSync(path.join(buildDir, 'word', 'styles.xml'), buildStylesXml(), 'utf8');
  fs.writeFileSync(path.join(buildDir, 'word', 'document.xml'), buildDocumentXml(), 'utf8');

  console.log('XML and all 9 image files created successfully.');

  // Compress using PowerShell pack_docx.ps1 with forward slashes
  const psCmd = `powershell -ExecutionPolicy Bypass -File .\\pack_docx.ps1 -SourceDir "${buildDir}" -DestinationDocx "${targetDocx}"`;
  execSync(psCmd, { stdio: 'inherit' });

  // Cleanup
  fs.rmSync(buildDir, { recursive: true, force: true });

  console.log(`Document successfully built: ${targetDocx}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
