const http = require('http');
const fs = require('fs');
const path = require('path');

// Define the path for the index.html file
const indexPath = path.join(__dirname, 'index.html');

// Define the port (443 is the default for HTTPS)
const PORT = 8080;

// Create the server
const server = http.createServer({}, (req, res) => {
    // Handle GET requests
    if(req.method === 'GET') {
        // Serve the index.html file when the root is requested
        if (req.url === '/')
            return sendFile(res, indexPath);
        else if (fs.existsSync(`.${req.url}`))
            return sendFile(res, `.${req.url}`);

        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
    } else
    // Handle POST requests
    if (req.method === 'POST') {
        // Collect data chunks
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        // End of data
        req.on('end', () => {
            console.log('Received POST data:\n' + body.replaceAll("=", " = ").split('&').join('\n'));
        });

        return sendFile(res, indexPath);
    }
});


// Start the server
server.listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}`);
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

function sendFile(res, filePath) {
    if (fs.existsSync(filePath)) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                return res.end('Internal Server Error');
            }
            setContentType({url: filePath}, res);
            return res.end(data);
        })
    }
}