const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 10000;
const path = require("path");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the admin panel (UI)
app.get("/", (req, res) => {
  res.send(`
    <h2>Ghost Redirector Admin</h2>
    <form method="POST" action="/add">
      <label>Code (e.g. ai)</label><br/>
      <input name="code" required /><br/>
      <label>URL to redirect to</label><br/>
      <input name="url" required /><br/><br/>
      <button>Add Link</button>
    </form>
    <hr/>
    <h3>All Links</h3>
    <ul>
      ${Object.entries(getLinks()).map(
        ([code, url]) => `<li><b>${code}</b>: ${url}</li>`
      ).join("")}
    </ul>
  `);
});

// Handle adding new code -> link pairs
app.post("/add", (req, res) => {
  const { code, url } = req.body;
  const links = getLinks();
  links[code] = url;
  fs.writeFileSync("links.json", JSON.stringify(links, null, 2));
  res.redirect("/");
});

// Cloaked redirect (hidden real URL inside an iframe)
app.get("/goto/:code", (req, res) => {
  const links = getLinks();
  const targetUrl = links[req.params.code];
  if (targetUrl) {
    res.send(`
      <html>
        <head><title>Connecting...</title></head>
        <body style="margin:0;overflow:hidden">
          <iframe src="${targetUrl}" frameborder="0" style="width:100%;height:100vh;"></iframe>
        </body>
      </html>
    `);
  } else {
    res.status(404).send("Redirect code not found.");
  }
});

// Helper: load links
function getLinks() {
  try {
    return JSON.parse(fs.readFileSync("links.json"));
  } catch (e) {
    return {};
  }
}

app.listen(port, () => {
  console.log(`Ghost Redirector running on http://localhost:${port}`);
});
