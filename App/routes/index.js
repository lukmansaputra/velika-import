const express = require("express");
const router = express.Router();
const dashboardHandle = require("./dashboard");
const productsHandle = require("./products");
const db = require("../database");

router.use("/dashboard", dashboardHandle);
router.use("/product", productsHandle);

router.get("/", async (req, res) => {
  const product = await db.getAllProducts();
  console.log(product.data);

  res.render("home", { products: product.data });
});

module.exports = router;
