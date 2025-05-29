const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../../../database");
const cloudinary = require("../../../helper/cloudinary");
const stream = require("stream");

// Setup memory storage (untuk buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

function replaceSpacesWithHyphens(text) {
  return text.replace(/\s+/g, "-").toLowerCase();
}

// GET form create
router.get("/", async (req, res) => {
  const categories = await db.getAllCategories();
  res.render("dashboard/product/new-product", { categories });
});

// POST create product
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const {
      product_name,
      item_weight,
      item_height,
      item_width,
      product_price,
      description,
      category_id,
    } = req.body;

    const uploadedUrls = [];

    for (const file of req.files) {
      const uploadPromise = new Promise((resolve, reject) => {
        const cloudStream = cloudinary.uploader.upload_stream(
          {
            folder: "produk",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(cloudStream);
      });

      const uploadedUrl = await uploadPromise;
      uploadedUrls.push(uploadedUrl);
    }

    // Simpan ke database
    const result = await db.createProduct({
      category_id,
      name: product_name,
      slug: replaceSpacesWithHyphens(product_name),
      price: product_price,
      description,
      images: uploadedUrls, // Simpan array URL Cloudinary
      width: item_width,
      height: item_height,
      weight: item_weight,
    });

    res.status(200).json({ message: "Product created", data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Tambah kategori
router.post("/add-category", async (req, res) => {
  try {
    const { name } = req.body;
    const slug = name.replace(/\s/g, "-").toLowerCase();

    const result = await db.insertCategories({ name, slug });
    res.status(200).json({ message: "Categories created", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create categories" });
  }
});

// Hapus produk
router.post("/delete", async (req, res) => {
  try {
    const productId = req.query.id;
    const result = await db.deleteProduct(productId);
    if (result.success) {
      res.status(200).json({ message: `Deleted product ${productId}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
