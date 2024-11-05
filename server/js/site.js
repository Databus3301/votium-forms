function send() {
    let msg = document.getElementById("antworten");
    fetch("/msgs", {
        method: "GET",
    }).then(response => response.text())
        .then(data => {
            let answers = JSON.parse(data);
            for (let i = 0; i < answers.length; i+=2) {
                let line = document.createElement("p");
                line.innerText = answers[i] + " | " + answers[i+1];
                msg.appendChild(line);
            }
        });

}

let u = new Umfrage();
console.log(u);
