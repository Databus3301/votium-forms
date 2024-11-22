
// prevent form redirects
document.getElementsByTagName("form")[0].addEventListener("submit", (e) => {
    e.preventDefault();
});