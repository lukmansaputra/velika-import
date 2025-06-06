const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const path = require("path");
const cors = require("cors");
const mainRoutes = require("./App/routes");
const db = require("./App/database");

const { formatCurrency, getLabel, currency } = require("./App/helper/currency");

const port = process.env.PORT || 8080;

// Gunakan EJS Layouts
app.use(expressLayouts);

// Set view engine EJS
app.set("view engine", "ejs");

// Set layout default
app.set("layout", "layouts/default"); // relatif terhadap folder views

// Set folder views
app.set("views", path.join(__dirname, "App/views")); // hanya satu!

// Set folder static

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*", // atau masukkan domain frontend produksi seperti 'https://namadomainkamu.vercel.app'
  })
);

// Custom middleware

app.use(async (req, res, next) => {
  const data = await db.getAllSettings();
  res.locals.formatCurrency = formatCurrency;
  res.locals.getLabel = getLabel;
  res.locals.currency = currency;
  res.locals.formatNumber = require("./App/helper/formatNumber");
  res.locals.website = data.data[0];
  res.locals.search = "";
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith("/product")) {
    res.locals.active = "product";
  } else if (req.path === "/") {
    res.locals.active = "home";
  } else if (req.path.includes("#about")) {
    res.locals.active = "about";
  } else if (req.path.includes("#contact")) {
    res.locals.active = "contact";
  } else {
    res.locals.active = ""; // fallback biar tidak undefined
  }
  next();
});

app.use("/", mainRoutes);

app.use((req, res) => {
  res.status(404).render("error/404", {
    code: 404,
    message: "Halaman tidak tersedia atau telah dipindahkan.",
  });
});

// Jalankan server
app.listen(port, () => {
  console.log("Server jalan di http://localhost:3000");
});
