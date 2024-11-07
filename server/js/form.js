// modulate a Umfragen object

class Form {
    constructor(id, frage, antworten) {
        this.id = id;
        this.frage = frage;
        this.antworten = antworten;
    }
}


class Question {
    constructor(text, type, answers) {
        this.question = text;
        this.type = type;
    }
}

class Answer {
    constructor(type, text) {
        this.type = type;
        this.text = text;
    }
}