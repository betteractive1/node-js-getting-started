const express = require("express");
const path = require("path");
const tracking = require("./tracking");
const PORT = process.env.PORT || 3000;

express()
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .get("/tracking/:id", tracking)
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
