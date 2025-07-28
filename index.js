const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

const LINKS_FILE = 'links.json';

// Load existing links or initialize
let links = {};
if (fs.existsSync(LINKS_FILE)) {
  links = JSON.parse(fs.readFileSync(LINKS_FILE));
}

// Redirect route
app.get('/goto/:code', (req, res) => {
  const code = req.params.code;
  const url = links[code];
  if (url) {
    res.redirect(url);
  } else {
    res.status(404).send('Shortlink not found');
  }
});

// Add new shortlink via query (e.g. /add?code=ai&url=https://chat.openai.com)
app.get('/add', (req, res) => {
  const { code, url } = req.query;

  if (!code || !url) {
    return res.status(400).send('Missing code or url');
  }

  links[code] = url;
  fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));
  res.send(`Shortlink added: ${code} -> ${url}`);
});

app.listen(PORT, () => {
  console.log(`Ghost Redirector running on http://localhost:${PORT}`);
});
