const http = require('http');
const fs = require('fs');
const path = require('path');

// Define the path for the index.html file
const indexPath = path.join(__dirname, 'index.html');

// Create the server
const server = http.createServer((req, res) => {
    // Serve the index.html file when the root is requested
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(indexPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (fs.existsSync(`.${req.url}`)) {
        fs.readFile (`.${req.url}`,  (err, data) =>  {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
                return;
            }
            setContentType(req, res);
            res.end(data);
        })
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Define the port
const PORT = 8080;

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


function setContentType(req, res) {
    let contentType = "text/plain";
    switch (path.extname(req.url)) {
        case '.html':
        case '.htm':
            contentType = 'text/html';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        case '.pdf':
            contentType = 'application/pdf';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
    }
    res.writeHead(200, { 'Content-Type': contentType });
}
