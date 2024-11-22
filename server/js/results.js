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
            document.getElementById('results').innerHTML = 'No results found for this survey.';
        } else {

        }
    });

})

// example table
/*
document.addEventListener('DOMContentLoaded', function() {
    // Get the context of the canvas element we want to select
    var ctx = document.getElementById('myChart').getContext('2d');

    // Create a new Chart instance
    var myChart = new Chart(ctx, {
        type: 'radar', // Specify the type of chart
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
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