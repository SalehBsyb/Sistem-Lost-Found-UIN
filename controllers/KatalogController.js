const db = require('../config/database');

const tampilkanKatalog = async (req, res) => {
    // Menangkap input pencarian dari URL (contoh: /katalog?cari=kunci)
    const kataKunci = req.query.cari || '';

    try {
        // Integrasi Tabel (JOIN) dan Filter Pencarian
        // Menampilkan barang yang statusnya 'Belum Diklaim' dan namanya mengandung kata kunci
        const [barang] = await db.query(
            `SELECT b.*, k.nama_kategori, p.nama_lengkap as nama_penemu 
             FROM Barang_Temuan b 
             JOIN Kategori_Barang k ON b.id_kategori = k.id_kategori 
             JOIN Pengguna p ON b.id_penemu = p.id_pengguna
             WHERE b.nama_barang LIKE ? AND b.status_barang = 'Belum Diklaim'
             ORDER BY b.tanggal_ditemukan DESC`,
            [`%${kataKunci}%`]
        );

        res.render('katalog', { 
            dataBarang: barang, 
            kataKunci: kataKunci,
            nama: req.session.nama 
        });
    } catch (error) {
        res.send('Terjadi kesalahan memuat katalog: ' + error.message);
    }
};

module.exports = { tampilkanKatalog };