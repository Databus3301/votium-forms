const chart_template = `
                                <div class="graph-container">
                                    <h2 class="graph-question">QUESTION_TEXT</h2>
                                    <div class="graph-umbrella">
                                        <canvas id="GRAPH_ID"></canvas>
                                    </div>
                                    <div class="type-buttons">Diagramm-Typ:
                                        <button class="answers" onclick="updateChart(this, 'bar')">Säulen</button>
                                        <button class="answers" onclick="updateChart(this, 'pie')">Kreis</button>
                                        <button class="answers" onclick="updateChart(this, 'line')">Linie</button>
                                        <button class="answers" onclick="updateChart(this, 'radar')">Radar</button>
                                        <button class="answers" onclick="updateChart(this, 'doughnut')">Donut</button>
                                    </div>
                                </div>
                              `
const text_template = `
                              <div class="graph-container">
                                  <h2 class="graph-question">QUESTION_TEXT</h2>
                                  <div class="graph-umbrella">
                                      <textarea rows="15" readonly="true">
TEXT
                                      </textarea>
                                  </div>
                              </div>
                              `

let charts = {example: {object: 'object'}};

// prevent default form submission
document.getElementsByTagName('form')[0].addEventListener('submit', async function(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    data.set('pass', await Utilities.hashString(data.get('pass')));
    data.set('id', await Utilities.hashString(data.get('name')));
    data.delete('name');

    // data to json
    data = JSON.stringify(Object.fromEntries(data.entries()));

    fetch('/get-results', {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'not_found') {
            // TODO: better error handling
            alert('No results found for this survey.');
        } else {
            // remove any currently displayed results
            document.getElementById('results').innerHTML = "";

            // TODO: fix radar chart bg not updating back to grid on deselect

            let questions = data.questions;
            questions.forEach(q => {

                if (!q.type) return;

                // if the type is suitable for table gen, gen a table
                if(q.type !== 'text') {
                    // format the answers
                    q.answers = formatAnswers(q);
                    // salt the questions for unique chart IDs
                    q.salt = Math.random().toString(36).substring(7)

                    // generate the chart
                    let chart = chart_template.replace('QUESTION_TEXT', q.text).replace('GRAPH_ID', q.text + "_" + q.salt);
                    document.getElementById('results').insertAdjacentHTML('beforeend', chart);
                    // get the context of the canvas element we want to select
                    let ctx = document.getElementById(q.text + "_" + q.salt).getContext('2d');

                    // save the chart instance to the charts object
                    charts[q.text + "_" + q.salt] =
                        new Chart(ctx, {
                            type: 'bar', // type derived from question type
                            data: {
                                labels: q.answers.map(a => a.text),
                                datasets: [{
                                    label: 'Stimmen',
                                    data: q.answers.map(a => parseInt(a.count)),
                                    backgroundColor: backgroundColors,
                                    borderColor: borderColors,
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }
                        });

                    // determine type, after "bar" default set correct sizing
                    let type = chooseType(q);
                    updateChartType(q.text + "_" + q.salt, type)
                }
                else
                // since text isn't able to be displayed as a chart, we'll just display it as a list
                if(q.type === 'text') {
                    let text = text_template.replace('QUESTION_TEXT', q.text);


                    let lines = "";
                    q.answers.forEach(a => {
                        lines += "» \"" + a + "\"\n"
                    });
                    text = text.replace('TEXT', lines);
                    document.getElementById('results').insertAdjacentHTML('beforeend', text);

                }
            })
        }

    });

})


function updateChart(button, type) {
    let id = button.parentNode.previousElementSibling.firstElementChild.id
    updateChartType(id, type);
}
function updateChartType(id, type) {
    charts[id].config.type = type;
    charts[id].update();
}

function chooseType(q) {
    if(q.type === 'checkbox') {
        return 'bar';
    } else if(q.type === 'multiple-choice') { // select rndmly between pie and doughnut
        return ['pie', 'doughnut'][Math.round(Math.random())]
    } else if(q.type === 'num') {
        return 'line';
    } else {
        return 'bar';
    }
}

function formatAnswers(q) {
    if(q.type === 'multiple-choice') {
        // set the answers arr to a list of objects containing one answer and it's appearance count each through a text and a count property
        let formatted = [];
        q.answers.forEach(userAnswer => {
            let answer = formatted.find(saved => saved.text === userAnswer);
            if(answer) {
                answer.count++;
            } else {
                formatted.push({text: userAnswer, count: 1});
            }
        });
        return formatted;
    }
    if(q.type === 'checkbox') {
        let formatted = [{text: "checked", count: 0},{text: "unchecked", count: 0}];
        q.answers.forEach(a => a === "" ?
            formatted[1].count++ :
            formatted[0].count++
        );
        return formatted;
    }
    if(q.type === 'num') {
        let formatted = [];
        q.answers = q.answers.map(a => a === "" ? 0 : parseInt(a));
        q.answers.sort((a, b) => a - b);
        q.answers.forEach(a => {
            formatted.push({text: a+"", count: a})
        });
        return formatted;
    }
}

const backgroundColors = [
    'rgba(255, 99, 132, 0.25)',   // Red
    'rgba(54, 162, 235, 0.25)',   // Blue
    'rgba(255, 206, 86, 0.25)',   // Yellow
    'rgba(75, 192, 192, 0.25)',   // Teal
    'rgba(153, 102, 255, 0.25)',  // Purple
    'rgba(255, 159, 64, 0.25)',   // Orange
    'rgba(201, 203, 207, 0.25)',  // Grey
    'rgba(255, 99, 71, 0.25)',    // Tomato
    'rgba(144, 238, 144, 0.25)',  // Light Green
    'rgba(255, 182, 193, 0.25)',  // Light Pink
    'rgba(255, 215, 0, 0.25)',    // Gold
    'rgba(0, 191, 255, 0.25)',    // Deep Sky Blue
    'rgba(138, 43, 226, 0.25)',   // Blue Violet
    'rgba(255, 140, 0, 0.25)',    // Dark Orange
    'rgba(46, 139, 87, 0.25)'     // Sea Green
];
const borderColors = [
    'rgba(255, 99, 132, 1)',     // Red
    'rgba(54, 162, 235, 1)',     // Blue
    'rgba(255, 206, 86, 1)',     // Yellow
    'rgba(75, 192, 192, 1)',     // Teal
    'rgba(153, 102, 255, 1)',    // Purple
    'rgba(255, 159, 64, 1)',     // Orange
    'rgba(201, 203, 207, 1)',    // Grey
    'rgba(255, 99, 71, 1)',      // Tomato
    'rgba(144, 238, 144, 1)',    // Light Green
    'rgba(255, 182, 193, 1)',    // Light Pink
    'rgba(255, 215, 0, 1)',      // Gold
    'rgba(0, 191, 255, 1)',      // Deep Sky Blue
    'rgba(138, 43, 226, 1)',     // Blue Violet
    'rgba(255, 140, 0, 1)',      // Dark Orange
    'rgba(46, 139, 87, 1)'       // Sea Green
];




