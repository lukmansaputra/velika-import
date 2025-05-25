const express = require("express");

const app = express();
const port = process.env.PORT || 8080;
const db = require("./Database");
app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log("server started");
});
