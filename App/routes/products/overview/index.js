const express = require("express");
const router = express.Router();
const db = require("../../../database");

router.get("/:productSlug", async (req, res) => {
  const product = await db.getProductBySlug(req.params.productSlug);
  console.log(product);

  res.render("products/overview", { product: product.data });
});

module.exports = router;
