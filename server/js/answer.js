
document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
        alert("Bitte gib einen Code ein!")
        window.location.href = "/";
    }

    console.log("Code: " + code);
    let hash = await hashString(code);
    console.log("Sha256: " + hash);

    // Query for a form corresponding to the hash
    fetch('https://votium.social/form', {
        method: 'POST',
        body: JSON.stringify({hash: hash})
    })
    // Parse the response as json
    .then(response => response.json())
    // Handle the parsed response
    .then(data => {
        // TODO: Populate the page according to the form data received here
       console.log(data);
    })
    // Handle errors
    .catch((error) => {
        console.error('Error:', error);
    });



});


async function hashString(input) {
    // Encode the input string as a Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Use the SubtleCrypto API to hash the data
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the hash to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}