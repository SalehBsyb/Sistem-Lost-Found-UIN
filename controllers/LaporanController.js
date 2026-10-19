const db = require("../config/database");
const multer = require("multer");
const path = require("path");

// ================= PENGATURAN MULTER (UPLOAD FOTO) =================
const storage = multer.diskStorage({
  destination: "./public/uploads/", // Lokasi simpan foto
  filename: function (req, file, cb) {
    // Nama file diubah otomatis (contoh: btm-1698765432.jpg)
    cb(null, "btm-" + Date.now() + path.extname(file.originalname));
  },
});

const uploadFoto = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Validasi Batas maksimal ukuran file (5 MB)
  fileFilter: function (req, file, cb) {
    // Validasi Ekstensi File
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpeg" || ext === ".jpg" || ext === ".png") {
      cb(null, true);
    } else {
      cb(new Error("Hanya diperbolehkan mengunggah file gambar (JPG/PNG)!"));
    }
  },
}).single("foto_asli");

// ================= LOGIKA CORE MODULE =================

// 1. Tampilkan Formulir Lapor (Read Kategori untuk Dropdown)
const tampilkanFormLapor = async (req, res) => {
  try {
    const [kategori] = await db.query("SELECT * FROM Kategori_Barang");
    res.render("form_lapor", { kategori: kategori, pesan: req.query.pesan });
  } catch (error) {
    res.send("Terjadi kesalahan saat memuat form.");
  }
};

// 2. Proses Pengiriman Laporan (Input -> Validasi -> DB -> Result)
const prosesLaporBarang = (req, res) => {
  uploadFoto(req, res, async (err) => {
    // Validasi File Upload
    if (err) {
      return res.redirect("/lapor-temuan?pesan=" + err.message);
    }
    if (!req.file) {
      return res.redirect("/lapor-temuan?pesan=Foto barang wajib diunggah!");
    }

    // Menangkap Inputan Text
    const { id_kategori, nama_barang, tanggal_ditemukan, waktu_ditemukan, lokasi_ditemukan, deskripsi_detail } = req.body;
    const foto_asli = req.file.filename;
    const id_penemu = req.session.id_pengguna; // Mengambil ID dari pengguna yang sedang login

    // Membuat ID Barang Temuan secara acak sederhana (Contoh: TMN-9823)
    const id_barang_temuan = "TMN-" + Math.floor(1000 + Math.random() * 9000);

    try {
      // Processing Database: Simpan ke tabel Barang_Temuan
      await db.query(
        `INSERT INTO Barang_Temuan 
                (id_barang_temuan, id_penemu, id_kategori, nama_barang, tanggal_ditemukan, waktu_ditemukan, lokasi_ditemukan, deskripsi_detail, foto_asli) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_barang_temuan,
          id_penemu,
          id_kategori,
          nama_barang,
          tanggal_ditemukan,
          waktu_ditemukan,
          lokasi_ditemukan,
          deskripsi_detail,
          foto_asli,
        ],
      );

      // Result: Berhasil
      res.redirect("/lapor-temuan?pesan=SUKSES: Barang temuan berhasil dilaporkan dan masuk ke katalog!");
    } catch (error) {
      res.redirect("/lapor-temuan?pesan=GAGAL: Kesalahan pada database - " + error.message);
    }
  });
};

module.exports = { tampilkanFormLapor, prosesLaporBarang };
