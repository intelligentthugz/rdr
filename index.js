const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Load or initialize links
let links = {};
const linksFile = 'links.json';
if (fs.existsSync(linksFile)) {
  links = JSON.parse(fs.readFileSync(linksFile));
}

// Admin panel
app.get('/', (req, res) => {
  res.render('admin', { links });
});

// Handle new link creation
app.post('/add', (req, res) => {
  const code = req.body.code || generateRandomCode();
  const url = req.body.url;
  if (code && url) {
    links[code] = url;
    fs.writeFileSync(linksFile, JSON.stringify(links, null, 2));
  }
  res.redirect('/');
});

// Redirect
app.get('/goto/:code', (req, res) => {
  const code = req.params.code;
  const url = links[code];
  if (url) {
    res.send(`
      <html>
      <head><title>Redirecting...</title></head>
      <body style="margin:0;padding:0;">
        <iframe src="${url}" style="border:none;width:100vw;height:100vh;"></iframe>
      </body>
      </html>
    `);
  } else {
    res.status(404).send('Link not found');
  }
});

// Random code generator
function generateRandomCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

app.listen(PORT, () => {
  console.log(`Ghost Redirector running at http://localhost:${PORT}`);
});
