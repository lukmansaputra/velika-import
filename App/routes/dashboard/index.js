const express = require("express");
const router = express.Router();
const productsHandle = require("./products");
const categoriesHandle = require("./categories");
const db = require("../../database");

// Tambahkan sebelum semua route di app.js
router.use((req, res, next) => {
  res.locals.layout = "layouts/admin"; // set layout admin otomatis
  next();
});

router.use("/product", productsHandle);
router.use("/category", categoriesHandle);

router.get("/", async (req, res) => {
  const products = await db.getAllProducts();
  const categories = await db.getAllCategories();
  console.log(categories);

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
});

module.exports = router;
