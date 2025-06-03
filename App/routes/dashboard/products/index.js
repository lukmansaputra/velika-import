const express = require("express");
const router = express.Router();
const db = require("../../../database");

const editProductsHandle = require("./edit-product");
const newProductsHandle = require("./new-product");

router.use("/new-product", newProductsHandle);
router.use("/edit-product", editProductsHandle);

router.get("/", async (req, res) => {
  const data = await db.getAllProducts();
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );
  const products = data.data.map((product) => {
    const start = new Date(product.discount_start);
    const end = new Date(product.discount_end);
    product.is_discount_active =
      product.is_discount && now >= start && now <= end;
    return product;
  });
  console.log(products);

  res.render("dashboard/product", { data: products });
});

router.post("/delete", async (req, res) => {
  try {
    const productId = req.query.id;
    const result = await db.deleteProduct(productId);
    if (result.success) {
      res.status(200).json({ message: `Deleted product ${productId}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

module.exports = router;
