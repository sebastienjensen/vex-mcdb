// Variable declarations
let api = 'http://127.0.0.1:5000/'
let endpoint;
let eventID;
let awards, awardsEx, awardsTC, awardsRS;

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

// Get team IDs for selected match
function loadMatchTeams() {
    endpoint = api + 'match/' + eventID + '/' + Number(document.getElementById('division').value) + '/' + Number(document.getElementById('round').value) + '/' + Number(document.getElementById('instance').value) + '/' + Number(document.getElementById('number').value);
    fetch(endpoint).then(response => response.json()).then(data => {
        if (data[0][1] == null) {
            loadMatchData('iq', Number(data[0][0]), Number(data[0][2]));
        } else {
            loadMatchData('v5', Number(data[0][0]), Number(data[0][1]), Number(data[0][2]), Number(data[0][3]));
        }
    });
}

// Get team IDs manually
function loadManualTeams() {
    if (document.getElementById('manual-2').value == '' || document.getElementById('manual-4').value == '') {
        endpoint = api + 'team/' + String(41) + '/' + String(document.getElementById('manual-1').value) + '/' + String(document.getElementById('manual-1').value) + '/' + String(document.getElementById('manual-3').value) + '/' + String(document.getElementById('manual-3').value);
        fetch(endpoint).then(response => response.json()).then(data => {
            loadMatchData('iq', Number(data["1"]), Number(data["3"]));
        });
    } else {
        endpoint = api + 'team/' + String(1) + '/' + String(document.getElementById('manual-1').value) + '/' + String(document.getElementById('manual-2').value) + '/' + String(document.getElementById('manual-3').value) + '/' + String(document.getElementById('manual-4').value);
        fetch(endpoint).then(response => response.json()).then(data => {
            loadMatchData('v5', Number(data["1"]), Number(data["2"]), Number(data["3"]), Number(data["4"]));
        });
    }
}

// Load team statistics
function loadMatchData(program, team1, team2, team3 = null, team4 = null) {
    if (program == 'v5') {
        hideCards('v5');
        endpoint = api + 'stat/' + eventID + '/' + team1 + '/' + team2 + '/' + team3 + '/' + team4;
        fetch(endpoint).then(response => response.json()).then(data => {
            document.getElementById('red1-number').innerHTML = data["teams"].red1["team_number"];
            document.getElementById('red1-name').innerHTML = data["teams"].red1["team_name"];
            document.getElementById('red1-org').innerHTML = data["teams"].red1["team_organization"];
            document.getElementById('red1-city').innerHTML = data["teams"].red1["team_city"];

            document.getElementById('red2-number').innerHTML = data["teams"].red2["team_number"];
            document.getElementById('red2-name').innerHTML = data["teams"].red2["team_name"];
            document.getElementById('red2-org').innerHTML = data["teams"].red2["team_organization"];
            document.getElementById('red2-city').innerHTML = data["teams"].red2["team_city"];

            document.getElementById('blue1-number').innerHTML = data["teams"].blue1["team_number"];
            document.getElementById('blue1-name').innerHTML = data["teams"].blue1["team_name"];
            document.getElementById('blue1-org').innerHTML = data["teams"].blue1["team_organization"];
            document.getElementById('blue1-city').innerHTML = data["teams"].blue1["team_city"];

            document.getElementById('blue2-number').innerHTML = data["teams"].blue2["team_number"];
            document.getElementById('blue2-name').innerHTML = data["teams"].blue2["team_name"];
            document.getElementById('blue2-org').innerHTML = data["teams"].blue2["team_organization"];
            document.getElementById('blue2-city').innerHTML = data["teams"].blue2["team_city"];

            // Red 1 statistics
            if (data["teams"].red1["matches_total"] >= 30) {
                document.getElementById('red1-match-season').classList.remove('hidden');
                document.getElementById('red1-match-season-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-match-season-stat').innerHTML = data["teams"].red1["matches_total"];
            } else {
                document.getElementById('red1-match-season').classList.add('hidden');
            }
            if (data["teams"].red1["matches_event"] >= 6) {
                document.getElementById('red1-match-event').classList.remove('hidden');
                document.getElementById('red1-match-event-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-match-event-stat').innerHTML = data["teams"].red1["matches_event"];
            } else {
                document.getElementById('red1-match-event').classList.add('hidden');
            }
            if (data["teams"].red1["points_total"] >= 500) {
                document.getElementById('red1-point-season').classList.remove('hidden');
                document.getElementById('red1-point-season-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-point-season-stat').innerHTML = data["teams"].red1["points_total"];
            } else {
                document.getElementById('red1-point-season').classList.add('hidden');
            }
            if (data["teams"].red1["points_event"] >= 150) {
                document.getElementById('red1-point-event').classList.remove('hidden');
                document.getElementById('red1-point-event-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-point-event-stat').innerHTML = data["teams"].red1["points_event"];
            } else {
                document.getElementById('red1-point-event').classList.add('hidden');
            }
            if (data["teams"].red1["points_avg_total"] >= 20) {
                document.getElementById('red1-point-avg-season').classList.remove('hidden');
                document.getElementById('red1-point-avg-season-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-point-avg-season-stat').innerHTML = data["teams"].red1["points_avg_total"];
            } else {
                document.getElementById('red1-point-avg-season').classList.add('hidden');
            }
            if (data["teams"].red1["points_avg_event"] >= 20) {
                document.getElementById('red1-point-avg-event').classList.remove('hidden');
                document.getElementById('red1-point-avg-event-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-point-avg-event-stat').innerHTML = data["teams"].red1["points_avg_event"];
            } else {
                document.getElementById('red1-point-avg-event').classList.add('hidden');
            }
            if (data["teams"].red1["wins_total"] >= 20) {
                document.getElementById('red1-win-season').classList.remove('hidden');
                document.getElementById('red1-win-season-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-win-season-stat').innerHTML = data["teams"].red1["wins_total"];
            } else {
                document.getElementById('red1-win-season').classList.add('hidden');
            }
            if (data["teams"].red1["wins_event"] >= 5) {
                document.getElementById('red1-win-event').classList.remove('hidden');
                document.getElementById('red1-win-event-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-win-event-stat').innerHTML = data["teams"].red1["wins_event"];
            } else {
                document.getElementById('red1-win-event').classList.add('hidden');
            }
            if (data["teams"].red1["wins_pct_total"] >= 70) {
                document.getElementById('red1-win-rate-season').classList.remove('hidden');
                document.getElementById('red1-win-rate-season-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-win-rate-season-stat').innerHTML = data["teams"].red1["wins_pct_total"] + '%';
            } else {
                document.getElementById('red1-win-rate-season').classList.add('hidden');
            }
            if (data["teams"].red1["wins_pct_event"] >= 70) {
                document.getElementById('red1-win-rate-event').classList.remove('hidden');
                document.getElementById('red1-win-rate-event-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-win-rate-event-stat').innerHTML = data["teams"].red1["wins_pct_event"] + '%';
            } else {
                document.getElementById('red1-win-rate-event').classList.add('hidden');
            }
            if (data["teams"].red1["team_hs_total"] >= 35) {
                document.getElementById('red1-hs-season').classList.remove('hidden');
                document.getElementById('red1-hs-season-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-hs-season-stat').innerHTML = data["teams"].red1["team_hs_total"];
                document.getElementById('red1-hs-season-match').innerHTML = data["teams"].red1["team_hs_total_match"];
            } else {
                document.getElementById('red1-hs-season').classList.add('hidden');
            }
            if (data["teams"].red1["team_hs_event"] >= 35) {
                document.getElementById('red1-hs-event').classList.remove('hidden');
                document.getElementById('red1-hs-event-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-hs-event-stat').innerHTML = data["teams"].red1["team_hs_total"];
                document.getElementById('red1-hs-event-match').innerHTML = data["teams"].red1["team_hs_event_match"];
            } else {
                document.getElementById('red1-hs-event').classList.add('hidden');
            }
            awards = data['teams'].red1['awards'];
            awardsEx = 0, awardsRS = 0, awardsTC = 0;
            for (award of awards) {
                if (award[0] == "Excellence Award (VRC/VEXU/VAIRC)" || award[0] == "Excellence Award - High School (VRC/VAIRC)" || award[0] == "Excellence Award - Middle School (VRC/VAIRC)") {
                    awardsEx += 1;
                } else if (award[0] == "Tournament Champions (VRC/VEXU/VAIRC)") {
                    awardsTC += 1;
                } else if (award[0] == "Robot Skills Champion (VRC/VEXU/VAIRC)") {
                    awardsRS += 1;
                }
            }
            if (awardsEx >= 3) {
                document.getElementById('red1-award-ex').classList.remove('hidden');
                document.getElementById('red1-award-ex-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-award-ex-stat').innerHTML = awardsEx;
            } else {
                document.getElementById('red1-award-ex').classList.add('hidden');
            }
            if (awardsTC >= 3) {
                document.getElementById('red1-award-tc').classList.remove('hidden');
                document.getElementById('red1-award-tc-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-award-tc-stat').innerHTML = awardsTC;
            } else {
                document.getElementById('red1-award-tc').classList.add('hidden');
            }
            if (awardsRS >= 3) {
                document.getElementById('red1-award-rs').classList.remove('hidden');
                document.getElementById('red1-award-rs-number').innerHTML = data["teams"].red1["team_number"];
                document.getElementById('red1-award-rs-stat').innerHTML = awardsRS;
            } else {
                document.getElementById('red1-award-rs').classList.add('hidden');
            }

            // Red 2 statistics
            if (data["teams"].red2["matches_total"] >= 30) {
                document.getElementById('red2-match-season').classList.remove('hidden');
                document.getElementById('red2-match-season-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-match-season-stat').innerHTML = data["teams"].red2["matches_total"];
            } else {
                document.getElementById('red2-match-season').classList.add('hidden');
            }
            if (data["teams"].red2["matches_event"] >= 6) {
                document.getElementById('red2-match-event').classList.remove('hidden');
                document.getElementById('red2-match-event-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-match-event-stat').innerHTML = data["teams"].red2["matches_event"];
            } else {
                document.getElementById('red2-match-event').classList.add('hidden');
            }
            if (data["teams"].red2["points_total"] >= 500) {
                document.getElementById('red2-point-season').classList.remove('hidden');
                document.getElementById('red2-point-season-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-point-season-stat').innerHTML = data["teams"].red2["points_total"];
            } else {
                document.getElementById('red2-point-season').classList.add('hidden');
            }
            if (data["teams"].red2["points_event"] >= 150) {
                document.getElementById('red2-point-event').classList.remove('hidden');
                document.getElementById('red2-point-event-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-point-event-stat').innerHTML = data["teams"].red2["points_event"];
            } else {
                document.getElementById('red2-point-event').classList.add('hidden');
            }
            if (data["teams"].red2["points_avg_total"] >= 20) {
                document.getElementById('red2-point-avg-season').classList.remove('hidden');
                document.getElementById('red2-point-avg-season-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-point-avg-season-stat').innerHTML = data["teams"].red2["points_avg_total"];
            } else {
                document.getElementById('red2-point-avg-season').classList.add('hidden');
            }
            if (data["teams"].red2["points_avg_event"] >= 20) {
                document.getElementById('red2-point-avg-event').classList.remove('hidden');
                document.getElementById('red2-point-avg-event-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-point-avg-event-stat').innerHTML = data["teams"].red2["points_avg_event"];
            } else {
                document.getElementById('red2-point-avg-event').classList.add('hidden');
            }
            if (data["teams"].red2["wins_total"] >= 20) {
                document.getElementById('red2-win-season').classList.remove('hidden');
                document.getElementById('red2-win-season-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-win-season-stat').innerHTML = data["teams"].red2["wins_total"];
            } else {
                document.getElementById('red2-win-season').classList.add('hidden');
            }
            if (data["teams"].red2["wins_event"] >= 5) {
                document.getElementById('red2-win-event').classList.remove('hidden');
                document.getElementById('red2-win-event-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-win-event-stat').innerHTML = data["teams"].red2["wins_event"];
            } else {
                document.getElementById('red2-win-event').classList.add('hidden');
            }
            if (data["teams"].red2["wins_pct_total"] >= 70) {
                document.getElementById('red2-win-rate-season').classList.remove('hidden');
                document.getElementById('red2-win-rate-season-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-win-rate-season-stat').innerHTML = data["teams"].red2["wins_pct_total"] + '%';
            } else {
                document.getElementById('red2-win-rate-season').classList.add('hidden');
            }
            if (data["teams"].red2["wins_pct_event"] >= 70) {
                document.getElementById('red2-win-rate-event').classList.remove('hidden');
                document.getElementById('red2-win-rate-event-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-win-rate-event-stat').innerHTML = data["teams"].red2["wins_pct_event"] + '%';
            } else {
                document.getElementById('red2-win-rate-event').classList.add('hidden');
            }
            if (data["teams"].red2["team_hs_total"] >= 35) {
                document.getElementById('red2-hs-season').classList.remove('hidden');
                document.getElementById('red2-hs-season-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-hs-season-stat').innerHTML = data["teams"].red2["team_hs_total"];
                document.getElementById('red2-hs-season-match').innerHTML = data["teams"].red2["team_hs_total_match"];
            } else {
                document.getElementById('red2-hs-season').classList.add('hidden');
            }
            if (data["teams"].red2["team_hs_event"] >= 35) {
                document.getElementById('red2-hs-event').classList.remove('hidden');
                document.getElementById('red2-hs-event-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-hs-event-stat').innerHTML = data["teams"].red2["team_hs_total"];
                document.getElementById('red2-hs-event-match').innerHTML = data["teams"].red2["team_hs_event_match"];
            } else {
                document.getElementById('red2-hs-event').classList.add('hidden');
            }
            awards = data['teams'].red2['awards'];
            awardsEx = 0, awardsRS = 0, awardsTC = 0;
            for (award of awards) {
                if (award[0] == "Excellence Award (VRC/VEXU/VAIRC)" || award[0] == "Excellence Award - High School (VRC/VAIRC)" || award[0] == "Excellence Award - Middle School (VRC/VAIRC)") {
                    awardsEx += 1;
                } else if (award[0] == "Tournament Champions (VRC/VEXU/VAIRC)") {
                    awardsTC += 1;
                } else if (award[0] == "Robot Skills Champion (VRC/VEXU/VAIRC)") {
                    awardsRS += 1;
                }
            }
            if (awardsEx >= 3) {
                document.getElementById('red2-award-ex').classList.remove('hidden');
                document.getElementById('red2-award-ex-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-award-ex-stat').innerHTML = awardsEx;
            } else {
                document.getElementById('red2-award-ex').classList.add('hidden');
            }
            if (awardsTC >= 3) {
                document.getElementById('red2-award-tc').classList.remove('hidden');
                document.getElementById('red2-award-tc-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-award-tc-stat').innerHTML = awardsTC;
            } else {
                document.getElementById('red2-award-tc').classList.add('hidden');
            }
            if (awardsRS >= 3) {
                document.getElementById('red2-award-rs').classList.remove('hidden');
                document.getElementById('red2-award-rs-number').innerHTML = data["teams"].red2["team_number"];
                document.getElementById('red2-award-rs-stat').innerHTML = awardsRS;
            } else {
                document.getElementById('red2-award-rs').classList.add('hidden');
            }

            // Blue 1 statistics
            if (data["teams"].blue1["matches_total"] >= 30) {
                document.getElementById('blue1-match-season').classList.remove('hidden');
                document.getElementById('blue1-match-season-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-match-season-stat').innerHTML = data["teams"].blue1["matches_total"];
            } else {
                document.getElementById('blue1-match-season').classList.add('hidden');
            }
            if (data["teams"].blue1["matches_event"] >= 6) {
                document.getElementById('blue1-match-event').classList.remove('hidden');
                document.getElementById('blue1-match-event-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-match-event-stat').innerHTML = data["teams"].blue1["matches_event"];
            } else {
                document.getElementById('blue1-match-event').classList.add('hidden');
            }
            if (data["teams"].blue1["points_total"] >= 500) {
                document.getElementById('blue1-point-season').classList.remove('hidden');
                document.getElementById('blue1-point-season-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-point-season-stat').innerHTML = data["teams"].blue1["points_total"];
            } else {
                document.getElementById('blue1-point-season').classList.add('hidden');
            }
            if (data["teams"].blue1["points_event"] >= 150) {
                document.getElementById('blue1-point-event').classList.remove('hidden');
                document.getElementById('blue1-point-event-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-point-event-stat').innerHTML = data["teams"].blue1["points_event"];
            } else {
                document.getElementById('blue1-point-event').classList.add('hidden');
            }
            if (data["teams"].blue1["points_avg_total"] >= 20) {
                document.getElementById('blue1-point-avg-season').classList.remove('hidden');
                document.getElementById('blue1-point-avg-season-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-point-avg-season-stat').innerHTML = data["teams"].blue1["points_avg_total"];
            } else {
                document.getElementById('blue1-point-avg-season').classList.add('hidden');
            }
            if (data["teams"].blue1["points_avg_event"] >= 20) {
                document.getElementById('blue1-point-avg-event').classList.remove('hidden');
                document.getElementById('blue1-point-avg-event-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-point-avg-event-stat').innerHTML = data["teams"].blue1["points_avg_event"];
            } else {
                document.getElementById('blue1-point-avg-event').classList.add('hidden');
            }
            if (data["teams"].blue1["wins_total"] >= 20) {
                document.getElementById('blue1-win-season').classList.remove('hidden');
                document.getElementById('blue1-win-season-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-win-season-stat').innerHTML = data["teams"].blue1["wins_total"];
            } else {
                document.getElementById('blue1-win-season').classList.add('hidden');
            }
            if (data["teams"].blue1["wins_event"] >= 5) {
                document.getElementById('blue1-win-event').classList.remove('hidden');
                document.getElementById('blue1-win-event-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-win-event-stat').innerHTML = data["teams"].blue1["wins_event"];
            } else {
                document.getElementById('blue1-win-event').classList.add('hidden');
            }
            if (data["teams"].blue1["wins_pct_total"] >= 70) {
                document.getElementById('blue1-win-rate-season').classList.remove('hidden');
                document.getElementById('blue1-win-rate-season-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-win-rate-season-stat').innerHTML = data["teams"].blue1["wins_pct_total"] + '%';
            } else {
                document.getElementById('blue1-win-rate-season').classList.add('hidden');
            }
            if (data["teams"].blue1["wins_pct_event"] >= 70) {
                document.getElementById('blue1-win-rate-event').classList.remove('hidden');
                document.getElementById('blue1-win-rate-event-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-win-rate-event-stat').innerHTML = data["teams"].blue1["wins_pct_event"] + '%';
            } else {
                document.getElementById('blue1-win-rate-event').classList.add('hidden');
            }
            if (data["teams"].blue1["team_hs_total"] >= 35) {
                document.getElementById('blue1-hs-season').classList.remove('hidden');
                document.getElementById('blue1-hs-season-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-hs-season-stat').innerHTML = data["teams"].blue1["team_hs_total"];
                document.getElementById('blue1-hs-season-match').innerHTML = data["teams"].blue1["team_hs_total_match"];
            } else {
                document.getElementById('blue1-hs-season').classList.add('hidden');
            }
            if (data["teams"].blue1["team_hs_event"] >= 35) {
                document.getElementById('blue1-hs-event').classList.remove('hidden');
                document.getElementById('blue1-hs-event-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-hs-event-stat').innerHTML = data["teams"].blue1["team_hs_total"];
                document.getElementById('blue1-hs-event-match').innerHTML = data["teams"].blue1["team_hs_event_match"];
            } else {
                document.getElementById('blue1-hs-event').classList.add('hidden');
            }
            awards = data['teams'].blue1['awards'];
            awardsEx = 0, awardsRS = 0, awardsTC = 0;
            for (award of awards) {
                if (award[0] == "Excellence Award (VRC/VEXU/VAIRC)" || award[0] == "Excellence Award - High School (VRC/VAIRC)" || award[0] == "Excellence Award - Middle School (VRC/VAIRC)") {
                    awardsEx += 1;
                } else if (award[0] == "Tournament Champions (VRC/VEXU/VAIRC)") {
                    awardsTC += 1;
                } else if (award[0] == "Robot Skills Champion (VRC/VEXU/VAIRC)") {
                    awardsRS += 1;
                }
            }
            if (awardsEx >= 3) {
                document.getElementById('blue1-award-ex').classList.remove('hidden');
                document.getElementById('blue1-award-ex-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-award-ex-stat').innerHTML = awardsEx;
            } else {
                document.getElementById('blue1-award-ex').classList.add('hidden');
            }
            if (awardsTC >= 3) {
                document.getElementById('blue1-award-tc').classList.remove('hidden');
                document.getElementById('blue1-award-tc-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-award-tc-stat').innerHTML = awardsTC;
            } else {
                document.getElementById('blue1-award-tc').classList.add('hidden');
            }
            if (awardsRS >= 3) {
                document.getElementById('blue1-award-rs').classList.remove('hidden');
                document.getElementById('blue1-award-rs-number').innerHTML = data["teams"].blue1["team_number"];
                document.getElementById('blue1-award-rs-stat').innerHTML = awardsRS;
            } else {
                document.getElementById('blue1-award-rs').classList.add('hidden');
            }

            // Blue 2 statistics
            if (data["teams"].blue2["matches_total"] >= 30) {
                document.getElementById('blue2-match-season').classList.remove('hidden');
                document.getElementById('blue2-match-season-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-match-season-stat').innerHTML = data["teams"].blue2["matches_total"];
            } else {
                document.getElementById('blue2-match-season').classList.add('hidden');
            }
            if (data["teams"].blue2["matches_event"] >= 6) {
                document.getElementById('blue2-match-event').classList.remove('hidden');
                document.getElementById('blue2-match-event-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-match-event-stat').innerHTML = data["teams"].blue2["matches_event"];
            } else {
                document.getElementById('blue2-match-event').classList.add('hidden');
            }
            if (data["teams"].blue2["points_total"] >= 500) {
                document.getElementById('blue2-point-season').classList.remove('hidden');
                document.getElementById('blue2-point-season-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-point-season-stat').innerHTML = data["teams"].blue2["points_total"];
            } else {
                document.getElementById('blue2-point-season').classList.add('hidden');
            }
            if (data["teams"].blue2["points_event"] >= 150) {
                document.getElementById('blue2-point-event').classList.remove('hidden');
                document.getElementById('blue2-point-event-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-point-event-stat').innerHTML = data["teams"].blue2["points_event"];
            } else {
                document.getElementById('blue2-point-event').classList.add('hidden');
            }
            if (data["teams"].blue2["points_avg_total"] >= 20) {
                document.getElementById('blue2-point-avg-season').classList.remove('hidden');
                document.getElementById('blue2-point-avg-season-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-point-avg-season-stat').innerHTML = data["teams"].blue2["points_avg_total"];
            } else {
                document.getElementById('blue2-point-avg-season').classList.add('hidden');
            }
            if (data["teams"].blue2["points_avg_event"] >= 20) {
                document.getElementById('blue2-point-avg-event').classList.remove('hidden');
                document.getElementById('blue2-point-avg-event-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-point-avg-event-stat').innerHTML = data["teams"].blue2["points_avg_event"];
            } else {
                document.getElementById('blue2-point-avg-event').classList.add('hidden');
            }
            if (data["teams"].blue2["wins_total"] >= 20) {
                document.getElementById('blue2-win-season').classList.remove('hidden');
                document.getElementById('blue2-win-season-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-win-season-stat').innerHTML = data["teams"].blue2["wins_total"];
            } else {
                document.getElementById('blue2-win-season').classList.add('hidden');
            }
            if (data["teams"].blue2["wins_event"] >= 5) {
                document.getElementById('blue2-win-event').classList.remove('hidden');
                document.getElementById('blue2-win-event-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-win-event-stat').innerHTML = data["teams"].blue2["wins_event"];
            } else {
                document.getElementById('blue2-win-event').classList.add('hidden');
            }
            if (data["teams"].blue2["wins_pct_total"] >= 70) {
                document.getElementById('blue2-win-rate-season').classList.remove('hidden');
                document.getElementById('blue2-win-rate-season-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-win-rate-season-stat').innerHTML = data["teams"].blue2["wins_pct_total"] + '%';
            } else {
                document.getElementById('blue2-win-rate-season').classList.add('hidden');
            }
            if (data["teams"].blue2["wins_pct_event"] >= 70) {
                document.getElementById('blue2-win-rate-event').classList.remove('hidden');
                document.getElementById('blue2-win-rate-event-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-win-rate-event-stat').innerHTML = data["teams"].blue2["wins_pct_event"] + '%';
            } else {
                document.getElementById('blue2-win-rate-event').classList.add('hidden');
            }
            if (data["teams"].blue2["team_hs_total"] >= 35) {
                document.getElementById('blue2-hs-season').classList.remove('hidden');
                document.getElementById('blue2-hs-season-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-hs-season-stat').innerHTML = data["teams"].blue2["team_hs_total"];
                document.getElementById('blue2-hs-season-match').innerHTML = data["teams"].blue2["team_hs_total_match"];
            } else {
                document.getElementById('blue2-hs-season').classList.add('hidden');
            }
            if (data["teams"].blue2["team_hs_event"] >= 35) {
                document.getElementById('blue2-hs-event').classList.remove('hidden');
                document.getElementById('blue2-hs-event-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-hs-event-stat').innerHTML = data["teams"].blue2["team_hs_total"];
                document.getElementById('blue2-hs-event-match').innerHTML = data["teams"].blue2["team_hs_event_match"];
            } else {
                document.getElementById('blue2-hs-event').classList.add('hidden');
            }
            awards = data['teams'].blue2['awards'];
            awardsEx = 0, awardsRS = 0, awardsTC = 0;
            for (award of awards) {
                if (award[0] == "Excellence Award (VRC/VEXU/VAIRC)" || award[0] == "Excellence Award - High School (VRC/VAIRC)" || award[0] == "Excellence Award - Middle School (VRC/VAIRC)") {
                    awardsEx += 1;
                } else if (award[0] == "Tournament Champions (VRC/VEXU/VAIRC)") {
                    awardsTC += 1;
                } else if (award[0] == "Robot Skills Champion (VRC/VEXU/VAIRC)") {
                    awardsRS += 1;
                }
            }
            if (awardsEx >= 3) {
                document.getElementById('blue2-award-ex').classList.remove('hidden');
                document.getElementById('blue2-award-ex-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-award-ex-stat').innerHTML = awardsEx;
            } else {
                document.getElementById('blue2-award-ex').classList.add('hidden');
            }
            if (awardsTC >= 3) {
                document.getElementById('blue2-award-tc').classList.remove('hidden');
                document.getElementById('blue2-award-tc-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-award-tc-stat').innerHTML = awardsTC;
            } else {
                document.getElementById('blue2-award-tc').classList.add('hidden');
            }
            if (awardsRS >= 3) {
                document.getElementById('blue2-award-rs').classList.remove('hidden');
                document.getElementById('blue2-award-rs-number').innerHTML = data["teams"].blue2["team_number"];
                document.getElementById('blue2-award-rs-stat').innerHTML = awardsRS;
            } else {
                document.getElementById('blue2-award-rs').classList.add('hidden');
            }
        });
    } else {
        hideCards('iq');
        endpoint = api + 'stat/' + eventID + '/' + team1 + '/' + team2;
        fetch(endpoint).then(response => response.json()).then(data => {
            document.getElementById('iq1-number').innerHTML = data["teams"].iq1["team_number"];
            document.getElementById('iq1-name').innerHTML = data["teams"].iq1["team_name"];
            document.getElementById('iq1-org').innerHTML = data["teams"].iq1["team_organization"];
            document.getElementById('iq1-city').innerHTML = data["teams"].iq1["team_city"];

            document.getElementById('iq2-number').innerHTML = data["teams"].iq2["team_number"];
            document.getElementById('iq2-name').innerHTML = data["teams"].iq2["team_name"];
            document.getElementById('iq2-org').innerHTML = data["teams"].iq2["team_organization"];
            document.getElementById('iq2-city').innerHTML = data["teams"].iq2["team_city"];

            // IQ 1 statistics
            if (data["teams"].iq1["matches_total"] >= 25) {
                document.getElementById('iq1-match-season').classList.remove('hidden');
                document.getElementById('iq1-match-season-number').innerHTML = data["teams"].iq1["team_number"];
                document.getElementById('iq1-match-season-stat').innerHTML = data["teams"].iq1["matches_total"];
            } else {
                document.getElementById('iq1-match-season').classList.add('hidden');
            }
            if (data["teams"].iq1["matches_event"] >= 6) {
                document.getElementById('iq1-match-event').classList.remove('hidden');
                document.getElementById('iq1-match-event-number').innerHTML = data["teams"].iq1["team_number"];
                document.getElementById('iq1-match-event-stat').innerHTML = data["teams"].iq1["matches_event"];
            } else {
                document.getElementById('iq1-match-event').classList.add('hidden');
            }
            if (data["teams"].iq1["points_total"] >= 400) {
                document.getElementById('iq1-point-season').classList.remove('hidden');
                document.getElementById('iq1-point-season-number').innerHTML = data["teams"].iq1["team_number"];
                document.getElementById('iq1-point-season-stat').innerHTML = data["teams"].iq1["points_total"];
            } else {
                document.getElementById('iq1-point-season').classList.add('hidden');
            }
            if (data["teams"].iq1["points_event"] >= 120) {
                document.getElementById('iq1-point-event').classList.remove('hidden');
                document.getElementById('iq1-point-event-number').innerHTML = data["teams"].iq1["team_number"];
                document.getElementById('iq1-point-event-stat').innerHTML = data["teams"].iq1["points_event"];
            } else {
                document.getElementById('iq1-point-event').classList.add('hidden');
            }
            if (data["teams"].iq1["points_avg_total"] >= 25) {
                document.getElementById('iq1-point-avg-season').classList.remove('hidden');
                document.getElementById('iq1-point-avg-season-number').innerHTML = data["teams"].iq1["team_number"];
                document.getElementById('iq1-point-avg-season-stat').innerHTML = data["teams"].iq1["points_avg_total"];
            } else {
                document.getElementById('iq1-point-avg-season').classList.add('hidden');
            }
            if (data["teams"].iq1["points_avg_event"] >= 25) {
                document.getElementById('iq1-point-avg-event').classList.remove('hidden');
                document.getElementById('iq1-point-avg-event-number').innerHTML = data["teams"].iq1["team_number"];
                document.getElementById('iq1-point-avg-event-stat').innerHTML = data["teams"].iq1["points_avg_event"];
            } else {
                document.getElementById('iq1-point-avg-event').classList.add('hidden');
            }
            if (data["teams"].iq1["team_hs_total"] >= 50) {
                document.getElementById('iq1-hs-season').classList.remove('hidden');
                document.getElementById('iq1-hs-season-number').innerHTML = data["teams"].iq1["team_number"];
                document.getElementById('iq1-hs-season-stat').innerHTML = data["teams"].iq1["team_hs_total"];
                document.getElementById('iq1-hs-season-match').innerHTML = data["teams"].iq1["team_hs_total_match"];
            } else {
                document.getElementById('iq1-hs-season').classList.add('hidden');
            }
            if (data["teams"].iq1["team_hs_event"] >= 40) {
                document.getElementById('iq1-hs-event').classList.remove('hidden');
                document.getElementById('iq1-hs-event-number').innerHTML = data["teams"].iq1["team_number"];
                document.getElementById('iq1-hs-event-stat').innerHTML = data["teams"].iq1["team_hs_total"];
                document.getElementById('iq1-hs-event-match').innerHTML = data["teams"].iq1["team_hs_event_match"];
            } else {
                document.getElementById('iq1-hs-event').classList.add('hidden');
            }
            awards = data['teams'].iq1['awards'];
            awardsEx = 0, awardsRS = 0, awardsTC = 0;
            for (award of awards) {
                if (award[0] == "Excellence Award (VRC/VEXU/VAIRC)" || award[0] == "Excellence Award - High School (VRC/VAIRC)" || award[0] == "Excellence Award - Middle School (VRC/VAIRC)") {
                    awardsEx += 1;
                } else if (award[0] == "Tournament Champions (VRC/VEXU/VAIRC)") {
                    awardsTC += 1;
                } else if (award[0] == "Robot Skills Champion (VRC/VEXU/VAIRC)") {
                    awardsRS += 1;
                }
            }
            if (awardsEx >= 2) {
                document.getElementById('iq1-award-ex').classList.remove('hidden');
                document.getElementById('iq1-award-ex-number').innerHTML = data["teams"].iq1["team_number"];
                document.getElementById('iq1-award-ex-stat').innerHTML = awardsEx;
            } else {
                document.getElementById('iq1-award-ex').classList.add('hidden');
            }
            if (awardsTC >= 2) {
                document.getElementById('iq1-award-tc').classList.remove('hidden');
                document.getElementById('iq1-award-tc-number').innerHTML = data["teams"].iq1["team_number"];
                document.getElementById('iq1-award-tc-stat').innerHTML = awardsTC;
            } else {
                document.getElementById('iq1-award-tc').classList.add('hidden');
            }
            if (awardsRS >= 2) {
                document.getElementById('iq1-award-rs').classList.remove('hidden');
                document.getElementById('iq1-award-rs-number').innerHTML = data["teams"].iq1["team_number"];
                document.getElementById('iq1-award-rs-stat').innerHTML = awardsRS;
            } else {
                document.getElementById('iq1-award-rs').classList.add('hidden');
            }

            // IQ 2 statistics
            if (data["teams"].iq2["matches_total"] >= 25) {
                document.getElementById('iq2-match-season').classList.remove('hidden');
                document.getElementById('iq2-match-season-number').innerHTML = data["teams"].iq2["team_number"];
                document.getElementById('iq2-match-season-stat').innerHTML = data["teams"].iq2["matches_total"];
            } else {
                document.getElementById('iq2-match-season').classList.add('hidden');
            }
            if (data["teams"].iq2["matches_event"] >= 6) {
                document.getElementById('iq2-match-event').classList.remove('hidden');
                document.getElementById('iq2-match-event-number').innerHTML = data["teams"].iq2["team_number"];
                document.getElementById('iq2-match-event-stat').innerHTML = data["teams"].iq2["matches_event"];
            } else {
                document.getElementById('iq2-match-event').classList.add('hidden');
            }
            if (data["teams"].iq2["points_total"] >= 400) {
                document.getElementById('iq2-point-season').classList.remove('hidden');
                document.getElementById('iq2-point-season-number').innerHTML = data["teams"].iq2["team_number"];
                document.getElementById('iq2-point-season-stat').innerHTML = data["teams"].iq2["points_total"];
            } else {
                document.getElementById('iq2-point-season').classList.add('hidden');
            }
            if (data["teams"].iq2["points_event"] >= 120) {
                document.getElementById('iq2-point-event').classList.remove('hidden');
                document.getElementById('iq2-point-event-number').innerHTML = data["teams"].iq2["team_number"];
                document.getElementById('iq2-point-event-stat').innerHTML = data["teams"].iq2["points_event"];
            } else {
                document.getElementById('iq2-point-event').classList.add('hidden');
            }
            if (data["teams"].iq2["points_avg_total"] >= 25) {
                document.getElementById('iq2-point-avg-season').classList.remove('hidden');
                document.getElementById('iq2-point-avg-season-number').innerHTML = data["teams"].iq2["team_number"];
                document.getElementById('iq2-point-avg-season-stat').innerHTML = data["teams"].iq2["points_avg_total"];
            } else {
                document.getElementById('iq2-point-avg-season').classList.add('hidden');
            }
            if (data["teams"].iq2["points_avg_event"] >= 25) {
                document.getElementById('iq2-point-avg-event').classList.remove('hidden');
                document.getElementById('iq2-point-avg-event-number').innerHTML = data["teams"].iq2["team_number"];
                document.getElementById('iq2-point-avg-event-stat').innerHTML = data["teams"].iq2["points_avg_event"];
            } else {
                document.getElementById('iq2-point-avg-event').classList.add('hidden');
            }
            if (data["teams"].iq2["team_hs_total"] >= 50) {
                document.getElementById('iq2-hs-season').classList.remove('hidden');
                document.getElementById('iq2-hs-season-number').innerHTML = data["teams"].iq2["team_number"];
                document.getElementById('iq2-hs-season-stat').innerHTML = data["teams"].iq2["team_hs_total"];
                document.getElementById('iq2-hs-season-match').innerHTML = data["teams"].iq2["team_hs_total_match"];
            } else {
                document.getElementById('iq2-hs-season').classList.add('hidden');
            }
            if (data["teams"].iq2["team_hs_event"] >= 40) {
                document.getElementById('iq2-hs-event').classList.remove('hidden');
                document.getElementById('iq2-hs-event-number').innerHTML = data["teams"].iq2["team_number"];
                document.getElementById('iq2-hs-event-stat').innerHTML = data["teams"].iq2["team_hs_total"];
                document.getElementById('iq2-hs-event-match').innerHTML = data["teams"].iq2["team_hs_event_match"];
            } else {
                document.getElementById('iq2-hs-event').classList.add('hidden');
            }
            awards = data['teams'].iq2['awards'];
            awardsEx = 0, awardsRS = 0, awardsTC = 0;
            for (award of awards) {
                if (award[0] == "Excellence Award (VRC/VEXU/VAIRC)" || award[0] == "Excellence Award - High School (VRC/VAIRC)" || award[0] == "Excellence Award - Middle School (VRC/VAIRC)") {
                    awardsEx += 1;
                } else if (award[0] == "Tournament Champions (VRC/VEXU/VAIRC)") {
                    awardsTC += 1;
                } else if (award[0] == "Robot Skills Champion (VRC/VEXU/VAIRC)") {
                    awardsRS += 1;
                }
            }
            if (awardsEx >= 2) {
                document.getElementById('iq2-award-ex').classList.remove('hidden');
                document.getElementById('iq2-award-ex-number').innerHTML = data["teams"].iq2["team_number"];
                document.getElementById('iq2-award-ex-stat').innerHTML = awardsEx;
            } else {
                document.getElementById('iq2-award-ex').classList.add('hidden');
            }
            if (awardsTC >= 2) {
                document.getElementById('iq2-award-tc').classList.remove('hidden');
                document.getElementById('iq2-award-tc-number').innerHTML = data["teams"].iq2["team_number"];
                document.getElementById('iq2-award-tc-stat').innerHTML = awardsTC;
            } else {
                document.getElementById('iq2-award-tc').classList.add('hidden');
            }
            if (awardsRS >= 2) {
                document.getElementById('iq2-award-rs').classList.remove('hidden');
                document.getElementById('iq2-award-rs-number').innerHTML = data["teams"].iq2["team_number"];
                document.getElementById('iq2-award-rs-stat').innerHTML = awardsRS;
            } else {
                document.getElementById('iq2-award-rs').classList.add('hidden');
            }
        });
    }
}

function refreshAllAward() {
    endpoint = api + 'refresh/award';
    fetch(endpoint);
}

function refreshAllTeam() {
    endpoint = api + 'refresh/team';
    fetch(endpoint);
}

function refreshAllEvent() {
    endpoint = api + 'refresh/event';
    fetch(endpoint);
}

function refreshAllMatch() {
    endpoint = api + 'refresh/match';
    fetch(endpoint);
}

// Event listeners
document.getElementById('theme').addEventListener('click', theme);
document.getElementById('refresh').addEventListener('click', getEvent);
document.getElementById('load').addEventListener('click', loadMatchTeams);
document.getElementById('refresh-team').addEventListener('click', refreshAllTeam);
document.getElementById('refresh-match').addEventListener('click', refreshAllMatch);
document.getElementById('refresh-event').addEventListener('click', refreshAllEvent);
document.getElementById('refresh-award').addEventListener('click', refreshAllAward);
document.getElementById('load-manual').addEventListener('click', loadManualTeams);