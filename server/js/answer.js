function send() {
    let msg = document.getElementById("antworten");
    fetch("/msgs", {
        method: "GET",
    }).then(response => response.text())
        .then(data => {
            let answers = JSON.parse(data);
            for (let i = 0; i < answers.length; i += 2) {
                let line = document.createElement("p");
                line.innerText = answers[i] + " | " + answers[i + 1];
                msg.appendChild(line);
            }
        });
}


document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");
    let params = window.location.search;
    if(params[0] === '?') {
        params = params.slice(1);
        params = params.split("&").map((param) => {return param.split("=")});
        console.log(params);

        for(let i = 0; i < params.length; i++) {
            let line = document.createElement("p");
            line.innerText = params[i];
            document.getElementById("antworten").appendChild(line);
        }
    }
    // or load here from URI params and in a answer,js script
});