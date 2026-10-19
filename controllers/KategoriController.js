const db = require("../config/database");

// 1. READ (Menampilkan Data)
const tampilkanKategori = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Kategori_Barang");
    // Mengirim data dari database ke file HTML/EJS
    res.render("kategori", { dataKategori: rows, pesan: req.query.pesan });
  } catch (error) {
    res.send("Terjadi kesalahan database: " + error.message);
  }
};

// 2. CREATE (Menambah Data Baru)
const tambahKategori = async (req, res) => {
  // Menangkap input dan menghilangkan spasi kosong di awal dan akhir teks
  const nama = req.body.nama_kategori.trim();

  // 1. Required Validation (Pengecekan Kekosongan)
  if (!nama || nama === "") {
    return res.redirect("/kategori?pesan=Validasi Gagal: Nama kategori wajib diisi!");
  }

  // 2. Range Validation (Pengecekan Panjang Karakter)
  // Nama kategori minimal 3 huruf (misal: "Tas", "Jam")
  if (nama.length < 3) {
    return res.redirect("/kategori?pesan=Validasi Gagal: Nama kategori minimal 3 karakter!");
  }

  try {
    // 3. Duplicate Validation (Pengecekan Data Ganda)
    const [cekDuplikat] = await db.query("SELECT * FROM Kategori_Barang WHERE nama_kategori = ?", [nama]);

    if (cekDuplikat.length > 0) {
      return res.redirect("/kategori?pesan=Validasi Gagal: Kategori tersebut sudah terdaftar di sistem!");
    }

    // Jika berhasil melewati semua hadangan validasi di atas, data baru disimpan
    await db.query("INSERT INTO Kategori_Barang (nama_kategori) VALUES (?)", [nama]);
    res.redirect("/kategori?pesan=Kategori sukses ditambahkan!");
  } catch (error) {
    res.redirect("/kategori?pesan=Terjadi kesalahan pada sistem database.");
  }
};

// 3. DELETE (Menghapus Data)
const hapusKategori = async (req, res) => {
  const id = req.params.id; // Mengambil ID dari URL
  try {
    await db.query("DELETE FROM Kategori_Barang WHERE id_kategori = ?", [id]);
    res.redirect("/kategori?pesan=Kategori berhasil dihapus!");
  } catch (error) {
    // Akan memicu error jika mode RESTRICT pada database menahan penghapusan
    res.redirect("/kategori?pesan=Gagal dihapus! Kategori ini sedang dipakai oleh sebuah laporan barang.");
  }
};

module.exports = { tampilkanKategori, tambahKategori, hapusKategori };
