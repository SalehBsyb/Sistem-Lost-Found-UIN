const db = require("../config/database");

const prosesLogin = async (req, res) => {
  const email = req.body.email;
  const password = req.body.kata_sandi;

  try {
    // Cari pengguna di database
    const [rows] = await db.query("SELECT * FROM Pengguna WHERE email = ? AND kata_sandi = ?", [email, password]);

    if (rows.length > 0) {
      const pengguna = rows[0];

      // Simpan identitas pengguna ke Session
      req.session.isLoggedIn = true;
      req.session.id_pengguna = pengguna.id_pengguna;
      req.session.nama = pengguna.nama_lengkap;
      req.session.peran = pengguna.peran_pengguna;

      // Arahkan berdasarkan peran
      if (pengguna.peran_pengguna === "Mahasiswa") {
        res.redirect("/katalog");
      } else if (pengguna.peran_pengguna === "Satpam") {
        res.redirect("/panel-petugas");
      } else {
        res.redirect("/katalog"); // Default admin
      }
    } else {
      // Jika salah, kembalikan ke halaman login dengan pesan error
      res.render("login", { error: "Email atau kata sandi tidak cocok!" });
    }
  } catch (error) {
    res.render("login", { error: "Terjadi kesalahan pada database." });
  }
};

const prosesLogout = (req, res) => {
  req.session.destroy(); // Hapus sesi
  res.redirect("/login"); // Kembalikan ke halaman login
};

module.exports = { prosesLogin, prosesLogout };
