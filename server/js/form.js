
class Form {
    constructor(id, questions) {
        this.id = id;
        this.questions = questions;
    }
}


class Question {
    constructor(text, type, answers) {
        this.question = text;       // the question text
        this.type = type;           // multiple choice, textual, numeric, checkbox
        this.answers = answers;
    }
}

class Answer {
    constructor(text) {
        this.text = text;
    }
}