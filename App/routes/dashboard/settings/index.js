const express = require("express");
const router = express.Router();
const db = require("../../../database");

router.get("/", async (req, res) => {
  const results = await db.getAllSettings();

  res.render("dashboard/settings", { data: results.data[0] });
});
router.post("/update", async (req, res) => {
  const result = await db.updateSetting(req.body.key, req.body.value);
  console.log(result);

  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  return res.status(200).json({ result });
});

module.exports = router;
