var http = require('http');
var fs = require('fs');
var generator = require('./js/generator.js');

function send404Response(response) {
    response.writeHead(404, {"Context-Type": "text\plain"});
    response.write("Error 404: Page not found");
    response.end();
}

function onRequest(request, response) {

    if (request.method == 'GET' && request.url == '/') {
        response.writeHead(200, {"Context-Type": "text\plain"});
        fs.createReadStream('./index.html').pipe(response);
    } else if (request.method === 'POST' && request.url == '/generate') {

        var result = generator.generateMelody(request.body);
        response.writeHead(200, {"Context-Type": "application/json"});
        response.write(JSON.stringify({
            result: result
        }));
        response.end();
    } else if (request.url == "/js/client.js") {
        var script = fs.readFileSync("js/client.js", "utf8");
        response.write(script);
        response.end();
    } else {
        send404Response(response);
    }
}

http.createServer(onRequest).listen(process.env.port || 8888);
console.log("Server is now running");