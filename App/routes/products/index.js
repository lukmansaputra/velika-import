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
  const page = parseInt(req.query.page) || 1;
  const limit = 15;

  const search = req.query.search;
  let productsResult;

  const categoriesResult = await db.getAllCategories();

  if (!categoriesResult.success) {
    return res.status(404).render("error/404", {
      code: 404,
      message: `Kategori tidak ditemukan.`,
    });
  }

  // Jika ada pencarian
  if (search) {
    res.locals.search = search;
    const searchResult = await db.searchProduct(search, page, limit);

    if (searchResult.success) {
      return res.render("products", {
        products: searchResult.data,
        categories: categoriesResult.data,
        sort,
        selectedCategory: category,
        pagination: searchResult.pagination,
      });
    } else {
      return res.render("products");
    }
  } else {
    res.locals.search = "";
  }

  // Load semua produk (fallback atau default)
  productsResult = await db.getAllFilterProducts({
    sort,
    categorySlug: category,
    page,
    limit,
  });

  if (!productsResult.success) {
    return res.status(404).render("error/404", {
      code: 404,
      message: `Halaman ${page} tidak ditemukan.`,
    });
  }

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
    pagination: productsResult.pagination,
  });
});

module.exports = router;
