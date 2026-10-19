const cekLogin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    next(); // Lanjutkan jika sudah login
  } else {
    res.redirect("/login"); // Tendang ke login jika belum
  }
};

module.exports = cekLogin;
