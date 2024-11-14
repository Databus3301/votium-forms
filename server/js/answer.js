
document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
        alert("Bitte gib einen Code ein!")
        window.location.href = "/";
    }

    console.log("Code: " + code);
    let hash = await hashString(code);
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
        console.log(data);
        // TODO: Display the form
        // code all the form types once in the answer.html file
        // then template them according to <data>
    })
    // Handle errors
    .catch((error) => {
        console.error('Error:', error);
    });



});


async function hashString(input) {
    // Encode the input string as a Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Use the SubtleCrypto API to hash the data
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the hash to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}



let formTemplate= {
    title: `<label style="justify-content: center"><h2>UMFRAGENTITEL</h2></label>`,
    numerical: `<div class="answer-umbrella">
                    <label><div style="font-weight: bold">QUESTION-TEXT</div>
                        <input name="QUESTION-TEXT" class="answers" type="number" placeholder="ANSWER-TEXT">
                    </label>
                </div>`,
    textual: `<div class="answer-umbrella">
                <label style="justify-content: center; font-weight: bold">QUESTION-TEXT</label>
                <label style="justify-content: center"><input name="QUESTION-TEXT" style="width: 75%" type="text" placeholder="ANSWER-TEXT"></label>
              </div>`,
    checkmark: `<div class="answer-umbrella">
                    <label><div style="font-weight: bold">QUESTION-TEXT</div>
                        <input name="QUESTION-TEXT" class="answers" type="checkbox" placeholder="ANSWER-TEXT">
                    </label>
                </div>`,
    multipleChoice_Q: `<fieldset>
                         <legend style="font-weight: bold">QUESTION-TEXT</legend>
                       </fieldset>`,
    multipleChoice_A: `<label>
                            ANSWER-TEXT
                            <input style="width: 5%; min-width: 10px" type="radio" name="html" value="ANSWER-TEXT">
                        </label><br>`
}