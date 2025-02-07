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

# Run app
if __name__ == "__main__":
    connection = database.connect(config["database"])
    # Initialize database if it doesn't exist
    database.onStart(connection)
    connection.close()
    app.run(host="0.0.0.0", debug=True)