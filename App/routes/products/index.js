const express = require("express");
const router = express.Router();
const overviewHandle = require("./overview");
const db = require("../../database");

router.use((req, res, next) => {
  res.locals.active = "product"; // set layout admin otomatis
  next();
});

router.use("/overview", overviewHandle);

router.get("/", async (req, res) => {
  const sort = req.query.sort || "newest";
  const category = req.query.category || null;

  const [productsResult, categoriesResult] = await Promise.all([
    db.getAllProducts(sort, category),
    db.getAllCategories(),
  ]);

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );

  const products = productsResult.data.map((product) => {
    const start = new Date(product.discount_start);
    const end = new Date(product.discount_end);
    product.is_discount_active =
      product.is_discount && now >= start && now <= end;
    return product;
  });

  res.render("products", {
    products,
    categories: categoriesResult.data,
    sort,
    selectedCategory: category,
    active: "product",
  });
});

module.exports = router;
