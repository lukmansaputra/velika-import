const express = require("express");
const router = express.Router();
const dashboardHandle = require("./dashboard");
const productsHandle = require("./products");

router.use("/dashboard", dashboardHandle);
router.use("/product", productsHandle);

router.get("/", (req, res) => {
  res.render("home");
});

module.exports = router;
