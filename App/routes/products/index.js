const express = require("express");
const router = express.Router();
const overviewHandle = require("./overview");
const db = require("../../database");

router.use("/overview", overviewHandle);

router.get("/", async (req, res) => {
  const sort = req.query.sort || "newest";
  const category = req.query.category || null;

  const [products, categories] = await Promise.all([
    db.getAllProducts(sort, category),
    db.getAllCategories(),
  ]);

  res.render("products", {
    products: products.data,
    categories: categories.data,
    sort,
    selectedCategory: category,
  });
});

// router.get("/search", async (req, res) => {
//   const query = req.query.q || "";
//   const sort = req.query.sort || "newest";
//   const category = req.query.category || null;

//   const result = await db.getAllProducts(sort, category);
//   if (!result.success) return res.send("Gagal memuat produk");

//   let filtered = result.data;

//   // Jika ada query pencarian
//   if (query) {
//     filtered = filtered.filter((p) =>
//       p.name.toLowerCase().includes(query.toLowerCase())
//     );
//   }

//   // Render partial produk saja (tanpa layout)
//   res.render("components/product-grid", {
//     products: filtered,
//     layout: false,
//   });
// });

module.exports = router;
