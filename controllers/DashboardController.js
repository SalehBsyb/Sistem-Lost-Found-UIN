const db = require('../config/database');

// Fitur Dasbor Satpam (Indikator & Transaksi Terbaru)
const tampilkanDashboard = async (req, res) => {
    try {
        // Query Indikator Angka (Mengambil dari Database Aktual)
        const [[{ total_barang }]] = await db.query('SELECT COUNT(*) as total_barang FROM Barang_Temuan');
        const [[{ belum_klaim }]] = await db.query(`SELECT COUNT(*) as belum_klaim FROM Barang_Temuan WHERE status_barang = 'Belum Diklaim'`);
        const [[{ total_kategori }]] = await db.query('SELECT COUNT(*) as total_kategori FROM Kategori_Barang');

        // Query Data Transaksi Terbaru
        const [terbaru] = await db.query(
            `SELECT * FROM Barang_Temuan ORDER BY waktu_unggah DESC LIMIT 5`
        );

        res.render('dashboard_satpam', { 
            total_barang, belum_klaim, total_kategori,
            dataTerbaru: terbaru,
            nama: req.session.nama 
        });
    } catch (error) {
        res.send('Terjadi kesalahan memuat dasbor: ' + error.message);
    }
};

// Fitur Laporan Terintegrasi
const cetakLaporan = async (req, res) => {
    try {
        // Menggabungkan 3 Tabel: Barang_Temuan, Kategori, dan Pengguna
        const [laporan] = await db.query(
            `SELECT b.id_barang_temuan, b.nama_barang, b.tanggal_ditemukan, b.status_barang, 
                    k.nama_kategori, p.nama_lengkap as penemu
             FROM Barang_Temuan b
             JOIN Kategori_Barang k ON b.id_kategori = k.id_kategori
             JOIN Pengguna p ON b.id_penemu = p.id_pengguna
             ORDER BY b.tanggal_ditemukan DESC`
        );

        // Render ke halaman khusus cetak
        res.render('laporan_cetak', { 
            dataLaporan: laporan, 
            tanggalCetak: new Date().toLocaleDateString('id-ID')
        });
    } catch (error) {
        res.send('Terjadi kesalahan memuat laporan: ' + error.message);
    }
};

module.exports = { tampilkanDashboard, cetakLaporan };