const http = require('http');
const fs = require('fs');
const path = require('path');

// Define the path for the index.html file
const indexPath = path.join(__dirname, './html/index.html');

// Define the server port
const PORT = 8080;

// Create the server
const server = http.createServer({}, (req, res) => {
    // Handle GET requests
    console.log(req.url);
    if(req.method === 'GET') {
        if(req.url.includes('?'))
            req.searchParams = req.url.split('?')[1].split('&');
        req.url = req.url.split('?')[0];
        servePage(res, req);
    } else
    // Handle POST requests
    if (req.method === 'POST') {
        // Collect data chunks
        let reqBody = '';
        req.on('data', chunk => {
            reqBody += chunk.toString();
        }); // Parse the data when the request ends
        req.on('end', () => {
            reqBody = decodeURIComponent(reqBody);
            // Handle the POST data if the request is not for a File
            if(!path.extname(req.url).startsWith('.'))
                handlePostData(req, res, reqBody);
        });
        // Serve the page if the request is for a File
        if(path.extname(req.url).startsWith('.'))
            servePage(res, req);
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
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
    }
}
function servePage(res, req) {
    if (req.url === '/')
        return sendFile(res, indexPath);
    else if (fs.existsSync(`.${req.url}`))
        return sendFile(res, `.${req.url}`);

    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 Not Found');
}

function handlePostData(req, res, data) {
    logPOST(data);
    // Handle the POST data according to the request URL
    // If the request is for a form, return the form data
    if(req.url === '/form') {
        data = JSON.parse(data);
        // Test if the POST data is in the correct format
        if(data.hash === undefined)
            return res.end('{"status": "bad_request_format"}');
        // Test if the form exists
        let path = `../umfragen/${data.hash}.json`;
        if(fs.existsSync(path))
            return sendFile(res, path);
        else
            return res.end('{"status": "not_found"}');
    }
    // default case
    res.writeHead(200, {'Content-Type': 'text/json'});
    res.end('{"status": "?_?"}');
}

function logPOST(reqBody)  {
    let date = new Date();
    let time = date.toLocaleTimeString();
    let heading = `[Received POST data at ${time}]:`;
    console.log(`${heading} ${"-".repeat(80-heading.length)}\n` + reqBody.split('&').join('\n'));
}