var Utilities = Utilities || {};

// Function to parse a string to HTML
Utilities.parseStringToHTML = function(str) {
    let parser = new DOMParser();
    // Parse the HTML string into a document
    return parser.parseFromString(str, 'text/html').body.firstElementChild;
};

// Function to hash a string using SHA-256
Utilities.hashString = async function(input) {
    // Encode the input string as a Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Use the SubtleCrypto API to hash the data
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the hash to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};


Utilities.redirect = function(page){
    window.location.href='https://votium.social/html/' + page;
}


