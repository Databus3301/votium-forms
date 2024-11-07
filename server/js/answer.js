
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        console.log("Code: " + code);
    } else {
        console.log("Code parameter not found.");
    }
    // or load here from URI params and in a answer,js script
});