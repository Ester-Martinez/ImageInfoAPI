const express = require("express");
const authRouter = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");
const bcryptSalt = 10;
const ensureLogin = require("connect-ensure-login");
const secure = require("../middlewares/secure.mid");


authRouter.get("/login", (req, res, next) => {
  res.render("auth/login");
});

authRouter.post(
  "/login",
  passport.authenticate("local-auth", {
    successRedirect: "/auth/index",
    failureRedirect: "/auth/login",
    passReqToCallback: true,
    failureFlash: true
  })
);

authRouter.get(
  "/index",
  [ensureLogin.ensureLoggedIn(), secure.initialRole()],
  (req, res) => {
    return
  }
);
authRouter.get(
  "/index-admin",
  [ensureLogin.ensureLoggedIn(), secure.checkRole("ADMIN")],
  (req, res) => {
    res.render("auth/index-admin");
  }
);

authRouter.get(
  "/index-dev",
  [ensureLogin.ensureLoggedIn(), secure.checkRole("DEVELOPER")],
  (req, res) => {
    res.render("auth/index-dev");
  }
);

authRouter.get(
  "/signup",
  [ensureLogin.ensureLoggedIn(), secure.checkRole("ADMIN")],
  (req, res) => {
    res.render("auth/signup");
  }
);

authRouter.post("/signup", (req, res, next) => {
  const { username, password, role } = req.body;
  if (username === "" || password === "") {
    res.render("auth/signup", {
      message: "Please, introduce both username and password"
    });
  }
  User.findOne({ username })
    .then(user => {
      if (user === null) {
        const salt = bcrypt.genSaltSync(bcryptSalt);
        const hashPass = bcrypt.hashSync(password, salt);

        const newUser = new User({
          username,
          password: hashPass,
          role
        });
        newUser.save(err => {
          if (err) {
            res.render("auth/signup", { message: "Something went wrong" });
          } else {
            res.redirect("/auth/index");
            return;
          }
        });
      } else {
        res.render("auth/signup", { message: "The user already exists" });
      }
    })
    .catch(error => {
      next(error);
    });
});

authRouter.get(
  "/profiles-admin",
  [ensureLogin.ensureLoggedIn(), secure.checkRole('ADMIN')],
  (req, res, next) => {
    if (req.query.error) {
      User.find()
        .select({ username: 1 })
        .then(allUsers => {
          res.render("auth/profiles-admin", {
            allUsers,
            error: "Something went wrong, please, try again"
          });
        })
        .catch(error => {
          res.json({ error: "Error while getting the users from the DB" });
        });
    } else {
      User.find()
        .select({ username: 1 })
        .then(allUsers => {
          res.render("auth/profiles-admin", { allUsers });
        })
        .catch(error => {
          res.json({ error: "Error while getting the users from the DB" });
        });
    }
  }
);

authRouter.post(
  "/profiles/delete",
  [ensureLogin.ensureLoggedIn(), secure.checkRole("ADMIN")],
  (req, res) => {
    User.findByIdAndDelete(req.body.id)
      .then(deletedUser => {
        res.redirect("/auth/profiles-admin");
      })
      .catch(error => {
        res.redirect("/auth/profiles-admin?error=please-try-again");
      });
  }
);

authRouter.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = authRouter;
