const express = require("express");
const router = express.Router();
const db = require("../../../database");

router.get("/:productSlug", async (req, res) => {
  try {
    const product = await db.getProductBySlug(req.params.productSlug);
    const p = product.data;

    // Bersihkan warna teks HTML
    p.description = p.description
      .replace(/style="[^"]*"/g, "")
      .replace(
        /<(ul|ol|li|p|span)([^>]*)>/g,
        '<$1 class="text-gray-900 dark:text-gray-300"$2>'
      );

    // Cek apakah diskon aktif berdasarkan waktu
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    const start = new Date(p.discount_start);
    const end = new Date(p.discount_end);

    // Diskon aktif hanya jika flag true dan dalam rentang waktu
    p.is_discount_active = p.is_discount && now >= start && now <= end;
    console.log(p.is_discount_active);
    console.log(now);
    console.log(start);
    console.log(end);

    res.render("products/overview", { product: p });
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan saat memuat produk.");
  }
});

module.exports = router;
