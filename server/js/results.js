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

let charts = {};

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
            // TODO: visualize the data
            // think of a sensible presentation of te text answers
            // fix radar chart bg not updating back to grid on deselect
            // fix only the most recent chart rendering

            let questions = data.questions;
            questions.forEach(q => {
                // salt the questions for unique chart IDs
                q.salt = Math.random().toString(36).substring(7)
                // generate the chart
                let chart = chart_template.replace('QUESTION_TEXT', q.text).replace('GRAPH_ID', q.text+"_"+q.salt);
                document.getElementById('results').innerHTML += chart;
                // get the context of the canvas element we want to select
                let ctx = document.getElementById(q.text+"_"+q.salt).getContext('2d');
                // create a new Chart instance
                let type = chooseType(q);
                // format the answers
                q.answers = formatAnswers(q);
                if(!type) return;
                // save the chart instance to the charts object
                charts[q.text+"_"+q.salt] =
                new Chart(ctx, {
                        type: type, // type derived from question type
                        data: {
                            labels: q.answers.map(a => a.text),
                            datasets: [{
                                label: 'Zahl an Stimmen',
                                data: q.answers.map(a => a.count),
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
            })
        }

    });

})

// example table
//*

document.addEventListener('DOMContentLoaded', function() {
    // Get the context of the canvas element we want to select
    let ctx = document.getElementById('myChart').getContext('2d');

    // Create a new Chart instance
    charts["myChart"] = new Chart(ctx, {
        type: 'bar', // Specify the type of chart
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
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
});
//*/

function updateChart(button, type) {
    let id = button.parentNode.previousElementSibling.firstElementChild.id
    charts[id].config.type = type;
    charts[id].update();
}

function chooseType(q) {
    if(q.type === 'checkbox') {
        return 'bar';
    } else if(q.type === 'multiple_choice') {
        return 'pie';
    } else if(q.type === 'number') {
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
        return q.answers.map(a => a === "" ? "unchecked" : "checked");
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