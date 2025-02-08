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

// Hide cards for teams not playing
function hideCards(mode) {
    if (mode == 'v5') {
        document.getElementById('iq').classList.add('hidden');
        document.getElementById('iq1').classList.add('hidden');
        document.getElementById('iq2').classList.add('hidden');
        document.getElementById('v5').classList.remove('hidden');
        document.getElementById('red1').classList.remove('hidden');
        document.getElementById('red2').classList.remove('hidden');
        document.getElementById('blue1').classList.remove('hidden');
        document.getElementById('blue2').classList.remove('hidden');
    } else {
        document.getElementById('v5').classList.add('hidden');
        document.getElementById('red1').classList.add('hidden');
        document.getElementById('red2').classList.add('hidden');
        document.getElementById('blue1').classList.add('hidden');
        document.getElementById('blue2').classList.add('hidden');
        document.getElementById('iq').classList.remove('hidden');
        document.getElementById('iq1').classList.remove('hidden');
        document.getElementById('iq2').classList.remove('hidden');
    }
}

// Event listeners
document.getElementById('theme').addEventListener('click', theme);
document.getElementById('refresh').addEventListener('click', getEvent);