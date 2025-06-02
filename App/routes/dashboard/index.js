const express = require("express");
const router = express.Router();
const productsHandle = require("./products");
const categoriesHandle = require("./categories");
const settingsHandle = require("./settings");
const db = require("../../database");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

// Middleware
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(
  session({
    secret: "secretadminkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 1 minggu dalam milidetik
  })
);

// Tambahkan sebelum semua route di app.js
router.use((req, res, next) => {
  res.locals.layout = "layouts/admin"; // set layout admin otomatis
  next();
});

router.use("/product", productsHandle);
router.use("/category", categoriesHandle);
router.use("/settings", settingsHandle);

// Load admin credentials
const loadAdmin = () => {
  const data = fs.readFileSync(path.join(__dirname, "./admin.json"));
  return JSON.parse(data);
};

// Routes

router.get("/", async (req, res) => {
  if (req.session.loggedIn) {
    const products = await db.getAllProducts();
    const categories = await db.getAllCategories();

    if (products.data.length === 0) {
      return res.render("dashboard/index.ejs", {
        totalProducts: 0,
      });
    }
    if (categories.data.length === 0) {
      return res.render("dashboard/index.ejs", {
        totalCategories: 0,
      });
    }
    const totalProducts = Object.keys(products.data).length;
    const totalCategories = Object.keys(categories.data).length;

    res.render("dashboard/index.ejs", { totalProducts, totalCategories });
  } else {
    res.redirect("/dashboard/login");
  }
});

router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/dashboard");
  } else {
    res.render("dashboard/auth/login", { layout: false, message: null });
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = loadAdmin();

  if (username === admin.username && password === admin.password) {
    req.session.loggedIn = true;
    req.session.username = username;
    res.redirect("/dashboard");
  } else {
    res.render("dashboard/auth/login", {
      layout: false,
      message: "Username atau password salah!",
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/dashboard/login");
  });
});

module.exports = router;
