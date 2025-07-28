const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Fake fingerprinting for stealth
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "PHP/7.4.3");
  res.setHeader("Server", "Apache");
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Redirect map
const redirectMap = {
  "8Jdks9z": "https://example.com",
  "t92LoaX": "https://github.com",
  "rhomani": "https://rhomani.com",
};

// Route for /goto/:id
app.get("/goto/:id", (req, res) => {
  const id = req.params.id;

  if (redirectMap[id]) {
    console.log(`[+] Redirecting to: ${redirectMap[id]}`);
    return res.redirect(302, redirectMap[id]);
  }

  // If ID not found
  res.status(404).send("Page not found.");
});

// Default homepage
app.get("/", (req, res) => {
  res.send("👻 Ghost Redirector active. Nothing to see here.");
});

app.listen(PORT, () => {
  console.log(`Ghost Redirector running on http://localhost:${PORT}`);
});
