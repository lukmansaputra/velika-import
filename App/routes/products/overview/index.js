const express = require("express");
const router = express.Router();
const db = require("../../../database");

router.get("/", async (req, res) => {
  const products = await db.getAllProducts();
  res.render("products", { products: products.data });
});

module.exports = router;
