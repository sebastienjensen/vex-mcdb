import sqlite3

# Returns a connection to the database
def connect(file):
    return sqlite3.connect(file)

# Runs on each start to check whether the database is initialized
def onStart(connection):
    cursor = connection.cursor()
    
    # Create config table if it doesn't exist
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS config (
            config_key STRING PRIMARY KEY,
            config_value STRING
        )
        """
    )
    connection.commit()

    # If this is the first run, initialize the database
    cursor.execute("SELECT * FROM config WHERE config_key='initialized'")
    if cursor.fetchone() == None:
        initialize(connection)
    
    cursor.close()

# Create tables and insert initial data for program and season
def initialize(connection):
    cursor = connection.cursor()

    # team
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS team (
            team_id INTEGER PRIMARY KEY,
            team_number STRING,
            team_name STRING,
            team_robot STRING,
            team_organisation STRING,
            team_city STRING,
            team_region STRING,
            team_country STRING,
            team_grade STRING,
            team_program INTEGER,
            FOREIGN KEY (team_program) REFERENCES program(program_id)
        )
        """
    )
    connection.commit()

    # award
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS award (
            award_id INTEGER,
            award_team INTEGER,
            award_event INTEGER,
            award_name STRING,
            PRIMARY KEY (award_id, award_team),
            FOREIGN KEY (award_event) REFERENCES event(event_id),
            FOREIGN KEY (award_team) REFERENCES team(team_id)
        )
        """
    )
    connection.commit()

    # event
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS event (
            event_id INTEGER PRIMARY KEY,
            event_sku STRING,
            event_name STRING,
            event_city STRING,
            event_season INTEGER,
            event_divisions INTEGER,
            FOREIGN KEY (event_season) REFERENCES season(season_id)
        )
        """
    )
    connection.commit()

    # dvision
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS division (
            division_id INTEGER PRIMARY KEY,
            division_event INTEGER,
            division_name STRING,
            FOREIGN KEY (division_event) REFERENCES event(event_id)
        )
        """
    )

    # match
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS match (
            match_id INTEGER PRIMARY KEY,
            match_event INTEGER,
            match_division INTEGER,
            match_name STRING,
            match_number INTEGER,
            match_instance INTEGER,
            match_round INTEGER,
            match_season INTEGER,
            match_team_red_1 INTEGER NULL,
            match_team_red_2 INTEGER NULL,
            match_team_blue_1 INTEGER NULL,
            match_team_blue_2 INTEGER NULL,
            match_score_red INTEGER NULL,
            match_score_blue INTEGER NULL,
            FOREIGN KEY (match_event) REFERENCES event(event_id),
            FOREIGN KEY (match_team_red_1) REFERENCES team(team_id),
            FOREIGN KEY (match_team_red_2) REFERENCES team(team_id),
            FOREIGN KEY (match_team_blue_1) REFERENCES team(team_id),
            FOREIGN KEY (match_team_blue_2) REFERENCES team(team_id),
            FOREIGN KEY (match_season) REFERENCES season(season_id)
        )
        """
    )
    connection.commit()

    # season, program
    # Inserts data without fetching from RE API
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS program (
            program_id INTEGER PRIMARY KEY,
            program_name STRING
        )
        """
    )
    cursor.execute("INSERT INTO program (program_id, program_name) VALUES (1, 'VEX V5 Robotics Competition')")
    cursor.execute("INSERT INTO program (program_id, program_name) VALUES (41, 'VEX IQ Robotics Competition')")
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS season (
            season_id INTEGER PRIMARY KEY,
            season_name STRING,
            season_program INTEGER,
            FOREIGN KEY (season_program) REFERENCES program(program_id)
        )
        """
    )
    cursor.execute("INSERT INTO season (season_id, season_name, season_program) VALUES (189, 'Rapid Relay', 41)")
    cursor.execute("INSERT INTO season (season_id, season_name, season_program) VALUES (190, 'High Stakes', 1)")
    connection.commit()

    # Mark database as initialized
    cursor.execute("INSERT INTO config (config_key, config_value) VALUES ('initialized', 'Y')")
    connection.commit()

    cursor.close()

# Insert data into the database
def insert(table, data, connection):
    cursor = connection.cursor()
    if table == "event":
        # Iterate through events and insert data
        for event in data:
            cursor.execute(
                """
                INSERT OR REPLACE INTO event (event_id, event_sku, event_name, event_city, event_season, event_divisions)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (event["id"], event["sku"], event["name"], event["location"]["city"], event["season"]["id"], len(event["divisions"]))
            )
    elif table == "team":
        # Iterate through teams and insert data
        for team in data:
            cursor.execute(
                """
                INSERT OR REPLACE INTO team (team_id, team_number, team_name, team_robot, team_organisation, team_city, team_region, team_country, team_grade, team_program)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (team["id"], team["number"], team["team_name"], team["robot_name"], team["organization"], team["location"]["city"], team["location"]["region"], team["location"]["country"], team["grade"], team["program"]["id"])
            )
    elif table == "award":
        # Iterate through awards and insert data
        for award in data:
            for winner in award["teamWinners"]:
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO award (award_id, award_team, award_name, award_event)
                    VALUES (?, ?, ?, ?)
                    """, (award["id"], winner["team"]["id"], award["title"], award["event"]["id"])
                )
    elif table == "match":
        # Iterate through matches and insert data
        for match in data:
            # Get program of current match via event table
            event = match["event"]["id"]
            cursor.execute("SELECT event_season FROM event WHERE event_id = ?", (event,))
            season = cursor.fetchone()[0]
            cursor.execute("SELECT season_program FROM season WHERE season_id = ?", (season,))
            program = cursor.fetchone()[0]
            # 1 is VRC, so has four teams
            if program == 1:
                red1 = match["alliances"][1]["teams"][0]["team"]["id"]
                red2 = match["alliances"][1]["teams"][1]["team"]["id"]
                blue1 = match["alliances"][0]["teams"][0]["team"]["id"]
                blue2 = match["alliances"][0]["teams"][1]["team"]["id"]
            # 41 is VIQRC, so has two teams
            elif program == 41:
                red1 = match["alliances"][1]["teams"][0]["team"]["id"]
                red2 = None
                blue1 = match["alliances"][0]["teams"][0]["team"]["id"]
                blue2 = None
            # Insert into database
            cursor.execute(
                """
                INSERT OR REPLACE INTO match (match_id, match_event, match_division, match_name, match_number, match_instance, match_round, match_season, match_team_red_1, match_team_red_2, match_team_blue_1, match_team_blue_2, match_score_red, match_score_blue)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (match["id"], event, match["division"]["id"], match["name"], match["matchnum"], match["instance"], match["round"], season, red1, red2, blue1, blue2, match["alliances"][1]["score"], match["alliances"][0]["score"])
            )
    connection.commit()
    cursor.close()

# Get an event's season
def eventSeason(event, cursor):
    cursor.execute(f"SELECT event_season FROM event WHERE event_id = {event}")
    return cursor.fetchone()[0]
    
# Return team ID from number and program
def teamID(program, team, cursor):
    cursor.execute(
        """
        SELECT team_id
        FROM team
        WHERE team_number = ? AND team_program = ?
        """, (team, program)
    )
    return cursor.fetchone()[0]

# Return the teams in a match
def teamIDMatch(event, div, match_type, match_inst, match_num, cursor):
    cursor.execute(
        f"""
        SELECT match.match_team_red_1, match.match_team_red_2, match.match_team_blue_1, match.match_team_blue_2, match.match_name, event.event_name
        FROM match
        INNER JOIN event ON match.match_event = event.event_id
        WHERE match_event = {event} AND match_division = {div} AND match_round = {match_type} AND match_instance = {match_inst} AND match_number = {match_num}
        """)
    return cursor.fetchall()

# Calculate a team's total points across a season
def teamPointTotal(team, cursor):
    cursor.execute(
        f"""
        SELECT SUM(total_points) AS total_score
        FROM (
            SELECT
                CASE
                    WHEN match_team_red_1 = {team} THEN match_score_red
                    WHEN match_team_red_2 = {team} THEN match_score_red
                    WHEN match_team_blue_1 = {team} THEN match_score_blue
                    WHEN match_team_blue_2 = {team} THEN match_score_blue
                    ELSE 0
                END AS total_points
            FROM match
        ) AS combined_scores
        """)
    return cursor.fetchone()[0]

# Calculate a team's points from an event
def teamPointEvent(team, event, cursor):
    cursor.execute(
        f"""
        SELECT SUM(total_points) AS total_score
        FROM (
            SELECT
                CASE
                    WHEN match_team_red_1 = {team} THEN match_score_red
                    WHEN match_team_red_2 = {team} THEN match_score_red
                    WHEN match_team_blue_1 = {team} THEN match_score_blue
                    WHEN match_team_blue_2 = {team} THEN match_score_blue
                    ELSE 0
                END AS total_points
            FROM match
            WHERE match_event = {event}
        ) AS combined_scores
        """)
    return cursor.fetchone()[0]

# Get the number of matches a team has played across a season
def teamMatchesTotal(team, cursor):
    cursor.execute(
        f"""
        SELECT COUNT(*) AS matches_played
        FROM match
        WHERE (match_score_red + match_score_blue) > 0 AND (
            match_team_red_1 = {team} OR 
            match_team_red_2 = {team} OR 
            match_team_blue_1 = {team} OR 
            match_team_blue_2 = {team} 
        )
        """)
    return cursor.fetchone()[0]

# Get the number of matches a team has played at an event
def teamMatchEvent(team, event, cursor):
    cursor.execute(
        f"""
        SELECT COUNT(*) AS matches_played
        FROM match
        WHERE (match_score_red + match_score_blue) > 0 AND (
            match_team_red_1 = {team} OR 
            match_team_red_2 = {team} OR 
            match_team_blue_1 = {team} OR 
            match_team_blue_2 = {team} 
        ) AND match_event = {event}
        """)
    return cursor.fetchone()[0]

# Get the number of matches a team has won across a season
def teamWinTotal(team, cursor):
    cursor.execute(
        f"""
        SELECT COUNT(*) AS matches_won
        FROM match
        WHERE(
            (match_team_red_1 = {team} OR match_team_red_2 = {team}) AND match_score_red > match_score_blue
            OR
            (match_team_blue_1 = {team} OR match_team_blue_2 = {team}) AND match_score_blue > match_score_red
        )""")
    return cursor.fetchone()[0]

# Get the number of matches a team has won at an event
def teamWinEvent(team, event, cursor):
    cursor.execute(
        f"""
        SELECT COUNT(*) AS matches_won
        FROM match
        WHERE(
            (match_team_red_1 = {team} OR match_team_red_2 = {team}) AND match_score_red > match_score_blue
            OR
            (match_team_blue_1 = {team} OR match_team_blue_2 = {team}) AND match_score_blue > match_score_red
        ) AND match_event = {event}""")
    return cursor.fetchone()[0]

# Get a team's high score across a season
def teamHSTotal(team, cursor):
    cursor.execute(
        f"""
        SELECT MAX(total_score) AS highest_score
        FROM (
            SELECT 
                CASE 
                    WHEN match_team_red_1 = {team} THEN match_score_red
                    WHEN match_team_red_2 = {team} THEN match_score_red
                    WHEN match_team_blue_1 = {team} THEN match_score_blue
                    WHEN match_team_blue_2 = {team} THEN match_score_blue
                END AS total_score
            FROM match
        ) AS scores; 
        """)
    return cursor.fetchone()[0]

# Get the match in which the team's season high score was achieved
def teamHSTotalMatch(team, score, cursor):
    cursor.execute(
        f"""
        SELECT match.match_name, event.event_name
        FROM match
        INNER JOIN event ON match.match_event = event.event_id
        WHERE (
            match_team_red_1 = {team} OR 
            match_team_red_2 = {team} OR 
            match_team_blue_1 = {team} OR 
            match_team_blue_2 = {team}
        ) AND (
            CASE 
                WHEN match_team_red_1 = {team} OR match_team_red_2 = {team} THEN match_score_red
                ELSE match_score_blue
            END) = {score}
        """)
    return cursor.fetchone()

# Get a team's high score from an event
def teamHSEvent(team, event, cursor):
    cursor.execute(
        f"""
        SELECT MAX(total_score) AS highest_score
        FROM (
            SELECT 
                CASE 
                    WHEN match_team_red_1 = {team} THEN match_score_red
                    WHEN match_team_red_2 = {team} THEN match_score_red
                    WHEN match_team_blue_1 = {team} THEN match_score_blue
                    WHEN match_team_blue_2 = {team} THEN match_score_blue
                END AS total_score
            FROM match
            WHERE match_event = {event}
        ) AS scores; 
        """)
    return cursor.fetchone()[0]

# Get the match in which the team's event high score was achieved
def teamHSEventMatch(team, event, score, cursor):
    cursor.execute(
        f"""
        SELECT match_name
        FROM match
        INNER JOIN event ON match.match_event = event.event_id
        WHERE (
            match_team_red_1 = {team} OR 
            match_team_red_2 = {team} OR 
            match_team_blue_1 = {team} OR 
            match_team_blue_2 = {team}
        ) AND (
            CASE 
                WHEN match_team_red_1 = {team} OR match_team_red_2 = {team} THEN match_score_red
                ELSE match_score_blue
            END) = {score}
        AND match_event = {event}
        """)
    return cursor.fetchone()[0]

# Return a team's name by ID
def teamName(team, cursor):
    cursor.execute(f"SELECT team_name FROM team WHERE team_id = {team}")
    return cursor.fetchone()[0]

# Return a team's number by ID
def teamNumber(team, cursor):
    cursor.execute(f"SELECT team_number FROM team WHERE team_id = {team}")
    return cursor.fetchone()[0]

# Return a team's grade by ID
def teamGrade(team, cursor):
    cursor.execute(f"SELECT team_grade FROM team WHERE team_id = {team}")
    return cursor.fetchone()[0]

# Return a team's organisation by ID
def teamOrg(team, cursor):
    cursor.execute(f"SELECT team_organization FROM team WHERE team_id = {team}")
    return cursor.fetchone()[0]

# Return a team's city by ID
def teamCity(team, cursor):
    cursor.execute(f"SELECT team_city FROM team WHERE team_id = {team}")
    return cursor.fetchone()[0]

# Return a team's region by ID
def teamCity(team, cursor):
    cursor.execute(f"SELECT team_region FROM team WHERE team_id = {team}")
    return cursor.fetchone()[0]

# Return a team's country by ID
def teamCity(team, cursor):
    cursor.execute(f"SELECT team_country FROM team WHERE team_id = {team}")
    return cursor.fetchone()[0]

# Return a team's robot name
def teamRobot(team, cursor):
    cursor.execute(f"SELECT team_robot FROM team WHERE team_id = {team}")
    return cursor.fetchone()[0]

# Return a team's awards
def awards(team, cursor):
    cursor.execute(
        f"""
        SELECT award.award_name, event.event_name
        FROM award
        INNER JOIN event ON award.award_event = event.event_id
        WHERE award.award_team = {team}
        """)
    return cursor.fetchall()