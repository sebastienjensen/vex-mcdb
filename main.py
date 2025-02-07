# Import libraries, modules
from flask import Flask, jsonify
from flask_cors import CORS
import fetch
import database
import json

# Import configuration
with open('config.json') as configFile:
    config = json.load(configFile)

# Initialise Flask app
app = Flask(__name__)
CORS(app)

# ROUTES

# Index
@app.route("/")
def index():
    return "vex-mcdb"

# Refresh data by region/country
@app.route("/refresh/<string:target>")
def refresh(target):
    # Fetch and submit event data for insertion
    if target == "event":
        connection = database.connect(config["database"])
        events = fetch.fetch(config, "events", {"region": config["region"], "season[]": config["season"]})
        database.insert("event", events, connection)
        connection.close()
        return f"Refreshed {len(events)} events"
    # Fetch and submit team data for insertion
    elif target == "team":
        connection = database.connect(config["database"])
        teams = fetch.fetch(config, "teams", {"country": config["country"], "program[]": config["program"]})
        database.insert("team", teams, connection)
        connection.close()
        return f"Refreshed {len(teams)} teams"
    # Fetch and submit award data for insertion
    # This can only be fetched after events have been fetched
    elif target == "award":
        connection = database.connect(config["database"])
        # Retrieve list of known events
        cursor = connection.cursor()
        cursor.execute("SELECT event_id FROM event")
        events = cursor.fetchall()
        # Fetch and insert awards from all known events
        for event in events:
            awards = fetch.fetch(config, f"events/{event[0]}/awards", {})
            database.insert("award", awards, connection)
        cursor.close()
        connection.close()
        return f"Refreshed awards from {len(events)} events"
    elif target == "match":
        connection = database.connect(config["database"])
        # Retrieve list of known events
        cursor = connection.cursor()
        cursor.execute("SELECT event_id, event_divisions FROM event")
        events = cursor.fetchall()
        # Fetch and insert matches from all known events
        for event, divisions in events:
            for division in range(1, divisions + 1):
                matches = fetch.fetch(config, f"events/{event}/divisions/{division}/matches", {})
                database.insert("match", matches, connection)
        cursor.close()
        connection.close()
        return f"Refreshed matches from {len(events)} events"
    
# Return team IDs from team numbers and program
@app.route("/team/<int:program>/<string:team1>/<string:team2>/<string:team3>/<string:team4>")
def retrieveID(program, team1, team2, team3, team4):
    connection = database.connect(config["database"])
    cursor = connection.cursor()
    response = {
        1: database.teamID(program, team1, cursor),
        2: database.teamID(program, team2, cursor),
        3: database.teamID(program, team3, cursor),
        4: database.teamID(program, team4, cursor)
    }
    cursor.close()
    connection.close()
    return jsonify(response)

# Return team IDs for a match
@app.route("/match/<int:event>/<int:div>/<int:matchType>/<int:matchInst>/<int:matchNum>")
def retrieveIDMatch(event, div, matchType, matchInst, matchNum):
    connection = database.connect(config["database"])
    cursor = connection.cursor()
    response = database.teamIDMatch(event, div, matchType, matchInst, matchNum, cursor)
    cursor.close()
    connection.close()
    return jsonify(response)

# Return full statistics for one team
@app.route("/stat/<int:event>/<int:team>")
def stat1(event, team):
    connection = database.connect(config["database"])
    cursor = connection.cursor() 
    response = {
        "season": database.eventSeason(event, cursor),
        "teams": {
            "red1": {
                "team_name": database.teamName(team, cursor),
                "team_number": database.teamNumber(team, cursor),
                "team_robot": database.teamRobot(team, cursor),
                "team_grade": database.teamGrade(team, cursor),
                "team_organization": database.teamOrg(team, cursor),
                "team_city": database.teamCity(team, cursor),
                "team_region": database.teamRegion(team, cursor),
                "team_country": database.teamCountry(team, cursor),
                "points_total": database.teamPointTotal(team, cursor),
                "points_event": database.teamPointEvent(team, event, cursor),
                "points_avg_total": int(database.teamPointTotal(team, cursor) / database.teamMatchTotal(team, cursor)) if database.teamMatchTotal(team, cursor) else 0,
                "points_avg_event": int(database.teamPointEvent(team, event, cursor) / database.teamMatchEvent(team, event, cursor)) if database.teamMatchEvent(team, event, cursor) else 0,
                "matches_total": database.teamMatchTotal(team, cursor),
                "matches_event": database.teamMatchEvent(team, event, cursor),
                "wins_total": database.teamWinTotal(team, cursor),
                "wins_event": database.teamWinEvent(team, event, cursor),
                "wins_pct_total": int((database.teamWinTotal(team, cursor) / database.teamMatchTotal(team, cursor)) * 100) if database.teamMatchTotal(team, cursor) else 0,
                "wins_pct_event": int((database.teamWinEvent(team, event, cursor) / database.teamMatchEvent(team, event, cursor)) * 100) if database.teamMatchEvent(team, event, cursor) else 0,
                "team_hs_total": database.teamHSTotal(team, cursor),
                "team_hs_event": database.teamHSEvent(team, event, cursor),
                "team_hs_total_match": database.teamHSTotalMatch(team, database.teamHSTotal(team, cursor), cursor),
                "team_hs_event_match": database.teamHSEventMatch(team, event, database.teamHSEvent(team, event, cursor), cursor),
                "awards": database.awards(team, cursor)
            }
        }
    }
    cursor.close()
    connection.close()
    return jsonify(response)

# Return full statistics for four teams (typical V5RC match)
@app.route("/stat/<int:event>/<int:team1>/<int:team2>/<int:team3>/<int:team4>")
def stat4(event, team1, team2, team3, team4):
    connection = database.connect(config["database"])
    cursor = connection.cursor() 
    response = {
        "season": database.eventSeason(event, cursor),
        "teams": {
            "red1": {
                "team_name": database.teamName(team1, cursor),
                "team_number": database.teamNumber(team1, cursor),
                "team_robot": database.teamRobot(team1, cursor),
                "team_grade": database.teamGrade(team1, cursor),
                "team_organization": database.teamOrg(team1, cursor),
                "team_city": database.teamCity(team1, cursor),
                "team_region": database.teamRegion(team1, cursor),
                "team_country": database.teamCountry(team1, cursor),
                "points_total": database.teamPointTotal(team1, cursor),
                "points_event": database.teamPointEvent(team1, event, cursor),
                "points_avg_total": int(database.teamPointTotal(team1, cursor) / database.teamMatchTotal(team1, cursor)) if database.teamMatchTotal(team1, cursor) else 0,
                "points_avg_event": int(database.teamPointEvent(team1, event, cursor) / database.teamMatchEvent(team1, event, cursor)) if database.teamMatchEvent(team1, event, cursor) else 0,
                "matches_total": database.teamMatchTotal(team1, cursor),
                "matches_event": database.teamMatchEvent(team1, event, cursor),
                "wins_total": database.teamWinTotal(team1, cursor),
                "wins_event": database.teamWinEvent(team1, event, cursor),
                "wins_pct_total": int((database.teamWinTotal(team1, cursor) / database.teamMatchTotal(team1, cursor)) * 100) if database.teamMatchTotal(team1, cursor) else 0,
                "wins_pct_event": int((database.teamWinEvent(team1, event, cursor) / database.teamMatchEvent(team1, event, cursor)) * 100) if database.teamMatchEvent(team1, event, cursor) else 0,
                "team_hs_total": database.teamHSTotal(team1, cursor),
                "team_hs_event": database.teamHSEvent(team1, event, cursor),
                "team_hs_total_match": database.teamHSTotalMatch(team1, database.teamHSTotal(team1, cursor), cursor),
                "team_hs_event_match": database.teamHSEventMatch(team1, event, database.teamHSEvent(team1, event, cursor), cursor),
                "awards": database.awards(team1, cursor)
            },
            "red2": {
                "team_name": database.teamName(team2, cursor),
                "team_number": database.teamNumber(team2, cursor),
                "team_robot": database.teamRobot(team2, cursor),
                "team_grade": database.teamGrade(team2, cursor),
                "team_organization": database.teamOrg(team2, cursor),
                "team_city": database.teamCity(team2, cursor),
                "team_region": database.teamRegion(team2, cursor),
                "team_country": database.teamCountry(team2, cursor),
                "points_total": database.teamPointTotal(team2, cursor),
                "points_event": database.teamPointEvent(team2, event, cursor),
                "points_avg_total": int(database.teamPointTotal(team2, cursor) / database.teamMatchTotal(team2, cursor)) if database.teamMatchTotal(team2, cursor) else 0,
                "points_avg_event": int(database.teamPointEvent(team2, event, cursor) / database.teamMatchEvent(team2, event, cursor)) if database.teamMatchEvent(team2, event, cursor) else 0,
                "matches_total": database.teamMatchTotal(team2, cursor),
                "matches_event": database.teamMatchEvent(team2, event, cursor),
                "wins_total": database.teamWinTotal(team2, cursor),
                "wins_event": database.teamWinEvent(team2, event, cursor),
                "wins_pct_total": int((database.teamWinTotal(team2, cursor) / database.teamMatchTotal(team2, cursor)) * 100) if database.teamMatchTotal(team2, cursor) else 0,
                "wins_pct_event": int((database.teamWinEvent(team2, event, cursor) / database.teamMatchEvent(team2, event, cursor)) * 100) if database.teamMatchEvent(team2, event, cursor) else 0,
                "team_hs_total": database.teamHSTotal(team2, cursor),
                "team_hs_event": database.teamHSEvent(team2, event, cursor),
                "team_hs_total_match": database.teamHSTotalMatch(team2, database.teamHSTotal(team2, cursor), cursor),
                "team_hs_event_match": database.teamHSEventMatch(team2, event, database.teamHSEvent(team2, event, cursor), cursor),
                "awards": database.awards(team2, cursor)
            },
            "blue1": {
                "team_name": database.teamName(team3, cursor),
                "team_number": database.teamNumber(team3, cursor),
                "team_robot": database.teamRobot(team3, cursor),
                "team_grade": database.teamGrade(team3, cursor),
                "team_organization": database.teamOrg(team3, cursor),
                "team_city": database.teamCity(team3, cursor),
                "team_region": database.teamRegion(team3, cursor),
                "team_country": database.teamCountry(team3, cursor),
                "points_total": database.teamPointTotal(team3, cursor),
                "points_event": database.teamPointEvent(team3, event, cursor),
                "points_avg_total": int(database.teamPointTotal(team3, cursor) / database.teamMatchTotal(team3, cursor)) if database.teamMatchTotal(team3, cursor) else 0,
                "points_avg_event": int(database.teamPointEvent(team3, event, cursor) / database.teamMatchEvent(team3, event, cursor)) if database.teamMatchEvent(team3, event, cursor) else 0,
                "matches_total": database.teamMatchTotal(team3, cursor),
                "matches_event": database.teamMatchEvent(team3, event, cursor),
                "wins_total": database.teamWinTotal(team3, cursor),
                "wins_event": database.teamWinEvent(team3, event, cursor),
                "wins_pct_total": int((database.teamWinTotal(team3, cursor) / database.teamMatchTotal(team3, cursor)) * 100) if database.teamMatchTotal(team3, cursor) else 0,
                "wins_pct_event": int((database.teamWinEvent(team3, event, cursor) / database.teamMatchEvent(team3, event, cursor)) * 100) if database.teamMatchEvent(team3, event, cursor) else 0,
                "team_hs_total": database.teamHSTotal(team3, cursor),
                "team_hs_event": database.teamHSEvent(team3, event, cursor),
                "team_hs_total_match": database.teamHSTotalMatch(team3, database.teamHSTotal(team3, cursor), cursor),
                "team_hs_event_match": database.teamHSEventMatch(team3, event, database.teamHSEvent(team3, event, cursor), cursor),
                "awards": database.awards(team3, cursor)
            },
            "blue2": {
                "team_name": database.teamName(team4, cursor),
                "team_number": database.teamNumber(team4, cursor),
                "team_robot": database.teamRobot(team4, cursor),
                "team_grade": database.teamGrade(team4, cursor),
                "team_organization": database.teamOrg(team4, cursor),
                "team_city": database.teamCity(team4, cursor),
                "team_region": database.teamRegion(team4, cursor),
                "team_country": database.teamCountry(team4, cursor),
                "points_total": database.teamPointTotal(team4, cursor),
                "points_event": database.teamPointEvent(team4, event, cursor),
                "points_avg_total": int(database.teamPointTotal(team4, cursor) / database.teamMatchTotal(team4, cursor)) if database.teamMatchTotal(team4, cursor) else 0,
                "points_avg_event": int(database.teamPointEvent(team4, event, cursor) / database.teamMatchEvent(team4, event, cursor)) if database.teamMatchEvent(team4, event, cursor) else 0,
                "matches_total": database.teamMatchTotal(team4, cursor),
                "matches_event": database.teamMatchEvent(team4, event, cursor),
                "wins_total": database.teamWinTotal(team4, cursor),
                "wins_event": database.teamWinEvent(team4, event, cursor),
                "wins_pct_total": int((database.teamWinTotal(team4, cursor) / database.teamMatchTotal(team4, cursor)) * 100) if database.teamMatchTotal(team4, cursor) else 0,
                "wins_pct_event": int((database.teamWinEvent(team4, event, cursor) / database.teamMatchEvent(team4, event, cursor)) * 100) if database.teamMatchEvent(team4, event, cursor) else 0,
                "team_hs_total": database.teamHSTotal(team4, cursor),
                "team_hs_event": database.teamHSEvent(team4, event, cursor),
                "team_hs_total_match": database.teamHSTotalMatch(team4, database.teamHSTotal(team4, cursor), cursor),
                "team_hs_event_match": database.teamHSEventMatch(team4, event, database.teamHSEvent(team4, event, cursor), cursor),
                "awards": database.awards(team4, cursor)
            }
        }
    }
    cursor.close()
    connection.close()
    return jsonify(response)

# Return full statistics for two teams (typical V5RC match)
@app.route("/stat/<int:event>/<int:team1>/<int:team2>")
def stat2(event, team1, team2):
    connection = database.connect(config["database"])
    cursor = connection.cursor() 
    response = {
        "season": database.eventSeason(event, cursor),
        "teams": {
            "iq1": {
                "team_name": database.teamName(team1, cursor),
                "team_number": database.teamNumber(team1, cursor),
                "team_robot": database.teamRobot(team1, cursor),
                "team_grade": database.teamGrade(team1, cursor),
                "team_organization": database.teamOrg(team1, cursor),
                "team_city": database.teamCity(team1, cursor),
                "team_region": database.teamRegion(team1, cursor),
                "team_country": database.teamCountry(team1, cursor),
                "points_total": database.teamPointTotal(team1, cursor),
                "points_event": database.teamPointEvent(team1, event, cursor),
                "points_avg_total": int(database.teamPointTotal(team1, cursor) / database.teamMatchTotal(team1, cursor)) if database.teamMatchTotal(team1, cursor) else 0,
                "points_avg_event": int(database.teamPointEvent(team1, event, cursor) / database.teamMatchEvent(team1, event, cursor)) if database.teamMatchEvent(team1, event, cursor) else 0,
                "matches_total": database.teamMatchTotal(team1, cursor),
                "matches_event": database.teamMatchEvent(team1, event, cursor),
                "wins_total": database.teamWinTotal(team1, cursor),
                "wins_event": database.teamWinEvent(team1, event, cursor),
                "wins_pct_total": int((database.teamWinTotal(team1, cursor) / database.teamMatchTotal(team1, cursor)) * 100) if database.teamMatchTotal(team1, cursor) else 0,
                "wins_pct_event": int((database.teamWinEvent(team1, event, cursor) / database.teamMatchEvent(team1, event, cursor)) * 100) if database.teamMatchEvent(team1, event, cursor) else 0,
                "team_hs_total": database.teamHSTotal(team1, cursor),
                "team_hs_event": database.teamHSEvent(team1, event, cursor),
                "team_hs_total_match": database.teamHSTotalMatch(team1, database.teamHSTotal(team1, cursor), cursor),
                "team_hs_event_match": database.teamHSEventMatch(team1, event, database.teamHSEvent(team1, event, cursor), cursor),
                "awards": database.awards(team1, cursor)
            },
            "iq2": {
                "team_name": database.teamName(team2, cursor),
                "team_number": database.teamNumber(team2, cursor),
                "team_robot": database.teamRobot(team2, cursor),
                "team_grade": database.teamGrade(team2, cursor),
                "team_organization": database.teamOrg(team2, cursor),
                "team_city": database.teamCity(team2, cursor),
                "team_region": database.teamRegion(team2, cursor),
                "team_country": database.teamCountry(team2, cursor),
                "points_total": database.teamPointTotal(team2, cursor),
                "points_event": database.teamPointEvent(team2, event, cursor),
                "points_avg_total": int(database.teamPointTotal(team2, cursor) / database.teamMatchTotal(team2, cursor)) if database.teamMatchTotal(team2, cursor) else 0,
                "points_avg_event": int(database.teamPointEvent(team2, event, cursor) / database.teamMatchEvent(team2, event, cursor)) if database.teamMatchEvent(team2, event, cursor) else 0,
                "matches_total": database.teamMatchTotal(team2, cursor),
                "matches_event": database.teamMatchEvent(team2, event, cursor),
                "wins_total": database.teamWinTotal(team2, cursor),
                "wins_event": database.teamWinEvent(team2, event, cursor),
                "wins_pct_total": int((database.teamWinTotal(team2, cursor) / database.teamMatchTotal(team2, cursor)) * 100) if database.teamMatchTotal(team2, cursor) else 0,
                "wins_pct_event": int((database.teamWinEvent(team2, event, cursor) / database.teamMatchEvent(team2, event, cursor)) * 100) if database.teamMatchEvent(team2, event, cursor) else 0,
                "team_hs_total": database.teamHSTotal(team2, cursor),
                "team_hs_event": database.teamHSEvent(team2, event, cursor),
                "team_hs_total_match": database.teamHSTotalMatch(team2, database.teamHSTotal(team2, cursor), cursor),
                "team_hs_event_match": database.teamHSEventMatch(team2, event, database.teamHSEvent(team2, event, cursor), cursor),
                "awards": database.awards(team2, cursor)
            }
        }
    }
    cursor.close()
    connection.close()
    return jsonify(response)

# Run app
if __name__ == "__main__":
    connection = database.connect(config["database"])
    # Initialize database if it doesn't exist
    database.onStart(connection)
    connection.close()
    app.run(host="0.0.0.0", debug=True)