const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const path = require("path");
const db = require("./Database");

const port = process.env.PORT || 8080;

// Gunakan EJS Layouts
app.use(expressLayouts);

// Set view engine EJS
app.set("view engine", "ejs");

// Set layout default
app.set("layout", "layouts/layout"); // relatif terhadap folder views

// Set folder views
app.set("views", path.join(__dirname, "App/views")); // hanya satu!

// Set folder static
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", (req, res) => {
  res.render("index");
});

// Jalankan server
app.listen(port, () => {
  console.log("Server jalan di http://localhost:3000");
});
