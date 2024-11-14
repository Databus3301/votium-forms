

let insertionPoint;
// Prefabs
let answerPrefab = `
    <label>Antwort
        <input type="text" name="answer-text" class="answers">
    </label>
`;
let questionPrefab = `
    <div class="question-umbrella">
        
        <p>
            <label>Fragentext
                <input type="text" name="question" class="answers" required>
            </label>
        </p>
        <p>
            <label>Fragentyp
                <select name="answer-type" required onchange="adjustAnswers(this)">
                    <option value="text">Textual</option>
                    <option value="multiple-choice">Multiple choice</option>
                    <option value="num">Numeric</option>
                    <option value="checkbox">Checkbox</option>
                </select>
            </label>
        </p>
        <p>
            ${answerPrefab}
            <button class="form-modifier" type="button" style="display:none" onclick="addAnswer(this)">+</button>
            <button class="form-modifier" type="button" style="display:none" onclick="removeAnswer(this)">-</button>
        </p>
        
    </div>
`;


document.addEventListener('DOMContentLoaded', () => {
    // get a ref to the initial label (Title) to use as an insertion point
    insertionPoint = document.getElementsByTagName('label')[0];
});

function addQuestion() {
    // use <questionPrefab> to create a new question
    let parser = new DOMParser();
    // Parse the HTML string into a document
    let doc = parser.parseFromString(questionPrefab, 'text/html');
    // Get the question element from the parsed HTML
    let question = doc.body.firstElementChild;
    // insert the question
    insertionPoint.parentNode.insertBefore(question, insertionPoint.nextSibling);
    // update insertion point to the added question
    insertionPoint = question;
}

function addAnswer(at) {
    // use <answerPrefab> to create a new answer
    let parser = new DOMParser();
    // Parse the HTML string into a document
    let doc = parser.parseFromString(answerPrefab, 'text/html');
    // Get the answer element from the parsed HTML
    let answer = doc.body.firstElementChild;
    // insert the answer
    at.parentNode.insertBefore(answer, at);
}
function removeAnswer(at) {
    // remove the answer
    if(at.previousElementSibling.previousElementSibling.tagName !== 'LABEL') return;
    at.previousElementSibling.previousElementSibling.remove();
}

function adjustAnswers(of) {
    // get the parent question
    let answersParagraph = of.parentNode.parentNode.nextElementSibling;
    // get the answers
    let answers = answersParagraph.getElementsByClassName('answers');
    // remove all answers
    while(answers.length > 1) {
        answers[1].parentNode.remove();
    }
    // add an answer if the type is multiple-choice
    if(of.value === 'multiple-choice') {
        addAnswer(answersParagraph.getElementsByTagName('button')[0]);
        // toggle add / remove buttons
        answersParagraph.getElementsByTagName('button')[0].style.display = 'inline';
        answersParagraph.getElementsByTagName('button')[1].style.display = 'inline';
    } else {
        if(answers.length === 0)
            addAnswer(answersParagraph.getElementsByTagName('button')[0]);
        // toggle add / remove buttons
        answersParagraph.getElementsByTagName('button')[0].style.display = 'none';
        answersParagraph.getElementsByTagName('button')[1].style.display = 'none';
    }
}