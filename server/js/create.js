// overwrite form submission
document.getElementsByTagName('form')[0].addEventListener('submit', async function(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    data.set('pass', await Utilities.hashString(data.get('pass')));
    data = new URLSearchParams(data).toString();

    await fetch('/create-form', {
        method: 'POST',
        body: data
    })
});




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
                <select name="question-type" required onchange="adjustAnswers(this)">
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
    insertionPoint = document.getElementsByTagName('label')[1];
});

function addQuestion() {
    let question = Utilities.parseStringToHTML(questionPrefab)
    // insert the question
    insertionPoint.parentNode.insertBefore(question, insertionPoint.nextSibling);
    // update insertion point to the added question
    insertionPoint = question;
}

function addAnswer(at) {
    let answer = Utilities.parseStringToHTML(answerPrefab);
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
    answers[0].parentNode.style.display = 'flex';
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
        // toggle checkbox input
        if(of.value === 'checkbox') {
            answers[0].parentNode.style.display = 'none';
        }
    }
}

