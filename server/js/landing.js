// trim the code b4 performing the get request
document.getElementsByTagName('form')[0].addEventListener('submit', function(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    let code = data.get('code').trim()
    window.location.href = `https://votium.social/html/answer.html?code=${code}`;
});