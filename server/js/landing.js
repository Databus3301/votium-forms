

document.getElementById('landingForm').addEventListener('submit',
function(event) {
            event.preventDefault();

            // TODO: fetch the data for the form
            // if in html format → set dom to fetch
            // if in json format → redirect to answer.html and parse the json


            console.log("about to redirect")
            window.location.href='https://votium.social/html/answer.html';
            console.log("redirected")
        }
);

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");
});

