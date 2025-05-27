const express = require("express");
const router = express.Router();
const dashboardHandle = require("./dashboard");

router.use("/dashboard", dashboardHandle);

router.get("/", (req, res) => {
  res.render("home");
});

module.exports = router;
