const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 10000;
const SECRET_KEY = "rhomani"; // Change this to your secret key!

const linksFile = path.join(__dirname, "links.json");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let links = JSON.parse(fs.readFileSync(linksFile));

// Redirect logic
app.get("/goto/:code", (req, res) => {
  const code = req.params.code;
  const link = links[code];
  if (link) {
    res.redirect(link);
  } else {
    res.status(404).send("Redirect code not found.");
  }
});

// Admin panel - protected with secret key
app.get("/admin", (req, res) => {
  if (req.query.key !== SECRET_KEY) return res.status(403).send("Unauthorized");

  let html = `
    <h2>Ghost Redirector Admin</h2>
    <form method="POST" action="/add?key=${SECRET_KEY}">
      <input name="code" placeholder="Code (e.g. ai)" required/>
      <input name="url" placeholder="URL to redirect to" required/>
      <button type="submit">Add Link</button>
    </form>
    <hr>
    <h3>All Links</h3>
    <ul>
  `;

  for (const code in links) {
    html += `<li><b>${code}</b>: ${links[code]} 
      <form method="POST" action="/delete?key=${SECRET_KEY}" style="display:inline">
        <input type="hidden" name="code" value="${code}" />
        <button type="submit">Delete</button>
      </form>
    </li>`;
  }

  html += `</ul>`;
  res.send(html);
});

// Add new redirect
app.post("/add", (req, res) => {
  if (req.query.key !== SECRET_KEY) return res.status(403).send("Unauthorized");

  const { code, url } = req.body;
  links[code] = url;
  fs.writeFileSync(linksFile, JSON.stringify(links, null, 2));
  res.redirect(`/admin?key=${SECRET_KEY}`);
});

// Delete a redirect
app.post("/delete", (req, res) => {
  if (req.query.key !== SECRET_KEY) return res.status(403).send("Unauthorized");

  const { code } = req.body;
  delete links[code];
  fs.writeFileSync(linksFile, JSON.stringify(links, null, 2));
  res.redirect(`/admin?key=${SECRET_KEY}`);
});

app.listen(PORT, () => {
  console.log(`Ghost Redirector running on http://localhost:${PORT}`);
});
