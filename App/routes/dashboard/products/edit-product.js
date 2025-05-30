const express = require("express");
const router = express.Router();
const db = require("../../../database");
const multer = require("multer");
const cloudinary = require("../../../helper/cloudinary");
const path = require("path");
const stream = require("stream");

// Gunakan memory storage agar tidak tulis ke filesystem
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Fungsi util: upload buffer ke Cloudinary
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const cloudStream = cloudinary.uploader.upload_stream(
      {
        folder: "produk",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    bufferStream.pipe(cloudStream);
  });
}

// Fungsi util: konversi teks ke slug
function replaceSpacesWithHyphens(text) {
  return text.replace(/\s+/g, "-").toLowerCase();
}

// GET form edit produk
router.get("/:productId", async (req, res) => {
  const categories = await db.getAllCategories();
  const result = await db.getProductById(req.params.productId);

  res.render("dashboard/product/edit-product", {
    product: result.data,
    images: result.data.images,
    categories: categories.data,
  });
});

// POST form edit produk
router.post("/", upload.array("images"), async (req, res) => {
  const {
    product_id,
    product_name,
    product_price,
    item_width,
    item_height,
    item_weight,
    is_discount,
    discount_percent,
    discount_start,
    discount_end,
    stock,
    description,
    category_id,
  } = req.body;
  function parseNullableDate(value) {
    return value === "null" || value === "" ? null : value;
  }

  // Handle existing images
  const existingImages = Array.isArray(req.body["existing_images"])
    ? req.body["existing_images"]
    : req.body["existing_images"]
    ? [req.body["existing_images"]]
    : [];

  const newFiles = req.files;

  try {
    // Ambil data produk lama
    const existingProduct = await db.getProductById(product_id);
    const oldImages = existingProduct.images || [];

    // Cari gambar yang dihapus (tidak ada di form submit)
    const imagesToDelete = oldImages.filter(
      (img) => !existingImages.includes(img)
    );

    // Hapus dari Cloudinary
    for (const imgUrl of imagesToDelete) {
      const publicId = imgUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`produk/${publicId}`);
    }

    // Upload gambar baru
    const newImageUrls = [];
    for (const file of newFiles) {
      const imageUrl = await uploadToCloudinary(file.buffer);
      newImageUrls.push(imageUrl);
    }

    // Gabungkan existing + new images
    const finalImages = [...existingImages, ...newImageUrls];

    // Update ke database
    const t = await db.updateProduct(product_id, {
      category_id,
      name: product_name,
      slug: replaceSpacesWithHyphens(product_name),
      price: product_price,
      width: item_width,
      height: item_height,
      weight: item_weight,
      is_discount,
      discount_percent,
      discount_start: parseNullableDate(discount_start),
      discount_end: parseNullableDate(discount_end),
      stock,
      description,
      images: finalImages,
    });
    console.log(t);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
