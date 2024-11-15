let formJson;

document.getElementsByTagName("form")[0].addEventListener("submit", async function (event) {
    event.preventDefault();

    let formData = new FormData(this);
    formJson.questions.forEach(q => {
        let res = formData.get(q.text);
        if(res == null || res === "")
            // NICHT BEANTWORTET
            console.log(q.text + ": --------------" );
        else
            // BEANTWORTET
            console.log(q.text + ": " + formData.get(q.text));
    })

   //window.location.href = "/html/thanks.html";
});



document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
        alert("Bitte gib einen Code ein!")
        window.location.href = "/";
    }

    console.log("Code: " + code);
    let hash = await Utilities.hashString(code);
    console.log("Sha256: " + hash);

    // Query for a form corresponding to the hash
    fetch('https://votium.social/get-form', {
        method: 'POST',
        body: JSON.stringify({hash: hash})
    })
    // Parse the response as json
    .then(response => response.json())
    // Handle the parsed response
    .then(data => {
        if(data.status !== "success") {
            alert("Formular nicht gefunden!\n\n Error: " + data.status);
            window.location.href = "/";
        }
        formJson = data;
        let form = document.getElementsByTagName("form")[0];
        let titleE = Utilities.parseStringToHTML(formTemplate.title.replace("UMFRAGENTITEL", data.title));
        form.insertBefore(titleE, form.firstChild);
        data.questions.forEach(question => {
            let questionE = Utilities.parseStringToHTML(formTemplate[question.type].replaceAll("QUESTION-TEXT", question.text).replace("ANSWER-TEXT", question.answers[0]));
            if(question.type === "multiple-choice") {
                question.answers.forEach(answer => {
                    let answerE = Utilities.parseStringToHTML(formTemplate["mc-answer"].replaceAll("ANSWER-TEXT", answer).replace("QUESTION-TEXT", question.text));
                    questionE.insertBefore(answerE, questionE.lastChild);
                });
            }
            form.insertBefore(questionE, form.lastChild.previousElementSibling);
        });

    })
    // Handle errors
    .catch((error) => {
        console.error('Error:', error);
    });



});




let formTemplate= {
    title: `<label style="justify-content: center"><h2>UMFRAGENTITEL</h2></label>`,
    "num": `<div class="answer-umbrella">
                    <label><div style="font-weight: bold">QUESTION-TEXT</div>
                        <input name="QUESTION-TEXT" class="answers" type="number" placeholder="ANSWER-TEXT">
                    </label>
                </div>`,
    "text": `<div class="answer-umbrella">
                <label style="justify-content: center; font-weight: bold">QUESTION-TEXT</label>
                <label style="justify-content: center"><input name="QUESTION-TEXT" style="width: 75%" type="text" placeholder="ANSWER-TEXT"></label>
              </div>`,
    "checkbox": `<div class="answer-umbrella">
                    <label><div style="font-weight: bold">QUESTION-TEXT</div>
                        <input name="QUESTION-TEXT" class="answers" type="checkbox" value="checked">
                    </label>
                </div>`,
    "multiple-choice": `<fieldset>
                         <legend style="font-weight: bold">QUESTION-TEXT</legend>
                         <label style="display: none">
                            DEFAULT
                            <input style="width: 5%; min-width: 10px" type="radio" name="QUESTION-TEXT" value="" checked="checked">
                        </label>
                       </fieldset>`,
    "mc-answer": `<label>
                            ANSWER-TEXT
                            <input style="width: 5%; min-width: 10px" type="radio" name="QUESTION-TEXT" value="ANSWER-TEXT">
                        </label><br>`
}