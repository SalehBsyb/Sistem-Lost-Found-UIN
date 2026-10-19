const express = require('express');
const session = require('express-session');
const path = require('path');
const { tampilkanFormLapor, prosesLaporBarang } = require('./controllers/LaporanController');

// Panggil Controller dan Middleware yang baru kita buat
const { prosesLogin, prosesLogout } = require('./controllers/AuthController');
const { tampilkanKategori, tambahKategori, hapusKategori } = require('./controllers/KategoriController');
const cekLogin = require('./middlewares/auth');

const app = express();
const port = 3000;

// Pengaturan Express
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Pengaturan Session
app.use(session({
    secret: 'rahasia-kampus-uin', 
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));

// ================= RUTE (ROUTES) ================= //

// 1. Rute Halaman Awal otomatis dialihkan ke Login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// 2. Rute Halaman Login
app.get('/login', (req, res) => {
    res.render('login', { error: undefined }); // Tampilkan views/login.ejs
});

// 3. Rute Proses Formulir Login
app.post('/proses-login', prosesLogin);

// 4. Rute Proses Logout
app.get('/logout', prosesLogout);

// 5. Rute Terlindungi (Protected Routes) - Mahasiswa
app.get('/katalog', cekLogin, (req, res) => {
    res.send(`<h1>Selamat datang di Katalog, ${req.session.nama}</h1> 
              <p>Anda login sebagai: ${req.session.peran}</p>
              <a href="/logout">Keluar (Logout)</a>`);
});

// 6. Rute Terlindungi (Protected Routes) - Satpam
app.get('/panel-petugas', cekLogin, (req, res) => {
    if (req.session.peran !== 'Satpam' && req.session.peran !== 'Administrator') {
        return res.send('Akses Ditolak! Halaman ini khusus Petugas Keamanan.');
    }
    res.send(`<h1>Panel Verifikasi Petugas</h1> 
              <p>Selamat bertugas, ${req.session.nama}</p>
              <a href="/logout">Keluar (Logout)</a>`);
});

// ================= RUTE CRUD KATEGORI ================= //
app.get('/kategori', cekLogin, tampilkanKategori); // Menampilkan halaman (Read)
app.post('/kategori/tambah', cekLogin, tambahKategori); // Proses tambah data (Create)
app.post('/kategori/hapus/:id', cekLogin, hapusKategori); // Proses hapus data (Delete)

// ================= RUTE CORE MODULE (PELAPORAN) ================= //
app.get('/lapor-temuan', cekLogin, tampilkanFormLapor);
app.post('/proses-lapor-temuan', cekLogin, prosesLaporBarang);

// ================= JALANKAN SERVER ================= //
app.listen(port, () => {
    console.log(`Server berjalan! Buka http://localhost:${port}`);
});