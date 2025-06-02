const express = require("express");
const router = express.Router();
const db = require("../../../database");

// const editProductsHandle = require("./edit-product");
// const newProductsHandle = require("./new-product");

// router.use("/new-product", newProductsHandle);
// router.use("/edit-product", editProductsHandle);

const currency = [
  { label: "IDR - Indonesia", value: "id-ID" },
  { label: "USD - United States", value: "en-US" },
  { label: "GBP - United Kingdom", value: "en-GB" },
  { label: "JPY - Japan", value: "ja-JP" },
  { label: "CNY - China", value: "zh-CN" },
  { label: "SGD - Singapore", value: "sg-SG" },
  { label: "EUR - Germany", value: "de-DE" },
];

router.get("/", async (req, res) => {
  const results = await db.getAllSettings();
  console.log(results);

  res.render("dashboard/settings", { data: results.data[0], currency });
});
router.post("/update", async (req, res) => {
  const result = await db.updateSetting(req.body.key, req.body.value);
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  return res.status(200).json({ result });
});

module.exports = router;
