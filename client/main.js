// Variable declarations
let api = 'http://127.0.0.1:5000/'
let endpoint;
let eventID;

// Toggle theme
function theme() {
    document.body.classList.toggle('dark');
}

// Refresh matches
function refreshMatches() {
    endpoint = api + 'refresh/event/' + String(eventID);
    fetch(endpoint);
}

// Get event ID from SKU
async function getEvent() {
    endpoint = api + 'event/' + String(document.getElementById('sku').value);
    await fetch(endpoint).then(response => response.json()).then(data => {eventID = data;});
    refreshMatches();
}

// Event listeners
document.getElementById('theme').addEventListener('click', theme);
document.getElementById('refresh').addEventListener('click', getEvent);