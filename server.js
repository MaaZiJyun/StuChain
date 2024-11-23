const { createServer } = require('https');
const { parse } = require('url');
const fs = require('fs');
const next = require('next');

// Load SSL certificates
const sslOptions = {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem'),
};

const app = next({ dev: true }); // Dev mode
const handle = app.getRequestHandler();

app.prepare().then(() => {
    // Start HTTPS server
    createServer(sslOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(3000, (err) => {
        if (err) throw err;
        console.log('Next.js HTTPS server running at https://localhost:3000');
    });
});
