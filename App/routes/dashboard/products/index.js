const express = require("express");
const router = express.Router();
const db = require("../../../database");

const editProductsHandle = require("./edit-product");
const newProductsHandle = require("./new-product");

router.use("/new-product", newProductsHandle);
router.use("/edit-product", editProductsHandle);

router.get("/", async (req, res) => {
  const data = await db.getAllProducts();

  res.render("dashboard/product", { data });
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
