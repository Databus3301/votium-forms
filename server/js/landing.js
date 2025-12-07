// trim the code b4 performing the get request
document.getElementsByTagName('form')[0].addEventListener('submit', function(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    let code = data.get('code').trim()
    Utilities.redirect('answer.html?code=' + code);
});

