const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "./views");

const linksFile = "links.json";

// Load links from JSON file
let links = {};
if (fs.existsSync(linksFile)) {
  links = JSON.parse(fs.readFileSync(linksFile));
}

// Admin panel
app.get("/", (req, res) => {
  res.render("admin", { links });
});

// Add new redirect
app.get("/add", (req, res) => {
  const { code, url } = req.query;
  if (!code || !url) return res.send("❌ Missing code or url");
  links[code] = url;
  fs.writeFileSync(linksFile, JSON.stringify(links));
  res.send("✅ Link added");
});

// Redirect handler
app.get("/goto/:code", (req, res) => {
  const url = links[req.params.code];
  if (url) res.redirect(url);
  else res.send("❌ Link not found");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
