const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Define the path for the index.html file
const indexPath = path.join(__dirname, './html/index.html');

// Define the server port
const PORT = 8080;

// Create the server
const server = http.createServer({}, (req, res) => {
    // Handle GET requests
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
    if(req.url === '/get-form') {
        data = JSON.parse(data);
        // Test if the POST data is in the correct format
        if(data.hash === undefined)
            return res.end('{"status": "bad_request_format"}');
        // Test if the form exists
        let path = `../umfragen/${data.hash}.json`;
        if(fs.existsSync(path)) {
            let file = fs.readFileSync(path, 'utf8');
            let content = JSON.parse(file);
            content.pass = "PASSWORT_PROTECTED";
            res.writeHead(200, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify(content));
        }
        else
            return res.end('{"status": "not_found"}');
    } else
    if (req.url === '/create-form') {
        // TODO: overwrite checks and user feedback if they wish to overwrite duplicate form
        // because currently it just auto-overwrites

        let params = new URLSearchParams(data);
        if(!params.has("title") || !params.has("pass"))
            return res.end('{"status": "bad_request_format"}');
        let hash = sha256Hash(params.get("title"));
        let path = `../umfragen/${hash}.json`;
        let file = fs.createWriteStream(path);

        file.write("{\n");
        file.write(`"status": "success",\n`);
        file.write(`"title": "${params.get("title")}",\n`);
        file.write(`"pass": "${params.get("pass")}",\n`);
        file.write(`"id": "${hash}",\n`);
        file.write(`"questions": [\n`);

        let writing = {question: false, answers: false};
        let wrote = {type: false, answers: false}
        for(const [key, value] of params) {
            if(key === "question") {
                if(writing.question) {
                    if(!(wrote.answers && wrote.type))
                        return error("bad_request_format\nincomplete_question");
                    writing.answers = wrote.answers = wrote.type = false;
                    file.write("]\n},\n");
                }
                file.write("{\n");
                file.write(`"text": "${value}",\n`);
                writing.question = true;
            }
            if (key ===  "question-type") {
                if (!writing.question)
                    return error("bad_request_format\nno_question_provided");
                file.write(`"type": "${value}",\n`);
                wrote.type = true;
            }
            if (key === "answer-text") {
                if (!(wrote.type && writing.question))
                    return error("bad_request_format\nno_question/(-type)_provided");
                if (!writing.answers) {
                    file.write(`"answers": [\n`);
                    file.write(`"${value}"\n`);
                    wrote.answers = writing.answers = true;
                } else {
                    file.write(`,"${value}"\n`);
                }
            }
        }
        if(!(wrote.answers && wrote.type))
            return error("bad_request_format\nincomplete_question");

        file.write("]\n}\n]\n}\n");
        file.end();



        req.url = '/';
        return servePage(res, req);

        function error(msg) {
            file.write("]\n}\n]\n}\n");
            file.end();
            if(fs.existsSync(path))
                fs.rmSync(path);
            res.writeHead(500, {'Content-Type': 'text/json'});
            res.end(`{"status": "${msg}"}`);
        }
    } else
    if (req.url === '/submit-form') {
        data = JSON.parse(data);
        // Test if the POST data is in the correct format
        if(!data.id)
            return res.end('{"status": "bad_request_format"}');
        let path = `../umfragen-ergebnisse/`;
        // ensure dir exists
        if(!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        // ensure file and form exist
        path += `${data.id}.json`;
        if(!fs.existsSync(path) && fs.existsSync(`../umfragen/${data.id}.json`)) {
            // set passwd to it's true value
            data.pass = JSON.parse(fs.readFileSync(`../umfragen/${data.id}.json`, 'utf8')).pass;
            // write <data> to the file
            fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
            return res.end('{"status": "success"}');
        }
        // If there is already a file for the form, append the data
        let file = fs.readFileSync(path, 'utf8');
        let fileData = JSON.parse(file);
        // loop through both the data and the fileData to append the answers to the questions
        for(let i = 0; i < data.questions.length; i++) {
            let question = data.questions[i];
            let fileQuestion = fileData.questions[i];
            if(question.id !== fileQuestion.id)
                return res.end('{"status": "bad_request_format"}');
            for(let j = 0; j < question.answers.length; j++) {
                fileQuestion.answers.push(question.answers[j]);
            }
        }
        fs.writeFileSync(path, JSON.stringify(fileData, null, 2), 'utf8');
        return res.end('{"status": "success"}');
    } else
    if(req.url === '/get-results') {
        data = JSON.parse(data);
        if(!data.pass || !data.id)
            return res.end('{"status": "bad_request_format"}');
        // load the potential form results
        let path = `../umfragen-ergebnisse/${data.id}.json`;
        if(fs.existsSync(path)) {
            let file = fs.readFileSync(path, 'utf8');
            let fileData = JSON.parse(file);
            // check if the password is correct
            if(fileData.pass === data.pass) {
                fileData.pass = "PASSWORT_PROTECTED";
                res.writeHead(200, {'Content-Type': 'application/json'});
                return res.end(JSON.stringify(fileData));
            }
            else
                return res.end('{"status": "incorrect_password"}');
        }
        else {
            return res.end('{"status": "not_found"}');
        }
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

function sha256Hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
