module.exports.checkLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth/login');
  }
};

module.exports.checkRole = role => (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === role) {
    next();
  } else {
    res.redirect('/auth/login');
  }
};

module.exports.initialRole = role => (req, res, next) => {
  if (req.user.role === "ADMIN") {
    res.redirect("/auth/index-admin")
    return
  };
  if (req.user.role === "DEVELOPER") {
    res.redirect("/auth/index-dev");
    return
  }
  else {
    res.redirect ("/auth/index")
  }
}