# vex-mcdb

MCDb interfaces with the RobotEvents API to surface team information and statistics, to supplement match introductions and commentary at VEX Robotics events (VEX IQ Robotics Competition and VEX Robotics Competition). It consists of the web server/API, which fetches and processes data from RobotEvents, and the web client, which makes requests to the server and presents data to the emcee.

MCDb is programmed with Python and SQLite is used for its database. This is not exactly a performant combination, and at least a rewrite in a compiled language is planned. Nonetheless, MCDb has been tested with events with up to 64 teams.

## Set up

Because the database is stored locally, read/write access is required.

### RobotEvents API

Access to the RobotEvents API is required. You can request access [here](https://www.robotevents.com/api/v2).

### Configuration

A `.env` file is used for configuring MCDb. Save it in the same directory as `main.py`.

|Key|Value|
|---|---|
|TOKEN|Your RobotEvents API access key|

## Database

The database is composed of eight tables, five of which are populated using the RobotEvents API. `config` is used to indicate whether the other tables have been created. `program` is only updated with the release of a new platform and `season` is only updated once per year. As such, their contents are hardcoded and copied to the database when it is created.

The database file can be deleted whenever MCDb is not running and it will be recreated on the next run.

### `config`

`config` holds one record, `initialized`. The initialization function will be called in the absence of this record.

|Field|Type||
|---|---|---|
|`config_key`|String|Primary key|
|`config_value`|String||

### `program`

`program` is populated without fetching from the RobotEvents API. It corresponds to the robotics platform being used, i.e., 'VEX V5 Robotics Competition' (`1`) or 'VEX IQ Robotics Competition' (`41`). Other programs are unsupported at this time.

|Field|Type||
|---|---|---|
|`program_id`|Integer|Primary key|
|`program_name`|String||

### `season`

`season` is populated without fetching from the RobotEvents API. It is updated once a year with the release of a new game.

|Field|Type||
|---|---|---|
|`season_id`|Integer|Primary key|
|`season_name`|String||
|`season_program`|Integer|Foreign key (`program(program_id)`)|

### `team`

`team` is populated with data from the RobotEvents API.

|Field|Type||
|---|---|---|
|`team_id`|Integer|Primary key|
|`team_number`|String||
|`team_name`|String||
|`team_robot`|String||
|`team_organization`|String||
|`team_city`|String||
|`team_region`|String||
|`team_country`|String||
|`team_program`|Integer|Foreign key (`program(program_id)`)|

### `award`

`award` is populated with data from the RobotEvents API. `award_id` as provided by the API is not itself sufficient to be a primary key. Awards with multiple winners, e.g., 'Tournament Champions', will appear multiple times, once for each winner. As such, both `award_id` and `award_team` are required for the primary key.

|Field|Type||
|---|---|---|
|`award_id`|Integer|Primary key (compound)|
|`award_team`|Integer|Primary key (compound), Foreign key (`team(team_id)`)|
|`award_event`|Integer|Foreign key (`event(event_id)`)|
|`award_name`|String||

### `event`

`event` is populated with data from the RobotEvents API. One of RobotEvents's quirks is `event_sku`, which seems to uniquely identify events alongside `event_id`. It is also what most competitors take to be the event ID without realising that there is another hidden ID. Yet, only the real ID is associated with events, matches, etc. in the API. This is a problem for database normalization, but it has been kept so that web clients can filter events by SKU, which will be more familiar to end users.

|Field|Type||
|---|---|---|
|`event_id`|Integer|Primary key|
|`event_sku`|String||
|`event_name`|String||
|`event_city`|String||
|`event_season`|Integer|Foreign key (`season(season_id)`)|
|`event_divisions`|Integer||

### `division`

`division` is populated with data from the RobotEvents API. Events' match lists are split by division and cannot be accessed together.

|Field|Type||
|---|---|---|
|`division_id`|Integer|Primary key|
|`division_name`|String||
|`division_event`|Integer|Foreign key (`event(event_id)`)|

### `match`

`match` is populated with data from the RobotEvents API. For VEX IQ Robotics Competition matches, where there are only two teams, one team is assigned to `match_team_red_1` and another to `match_team_blue_1`, and `match_team_red_2` and `match_team_blue_2` are set to `None`.

|Field|Type||
|---|---|---|
|`match_id`|Integer|Primary key|
|`match_event`|Integer|Foreign key (`event(event_id)`)|
|`match_division`|Integer||
|`match_name`|String||
|`match_number`|Integer||
|`match_instance`|Integer||
|`match_round`|Integer||
|`match_team_red_1`|Integer|Foreign key (`team(team_id)`)|
|`match_team_red_2`|Integer|Foreign key (`team(team_id)`)|
|`match_team_blue_1`|Integer|Foreign key (`team(team_id)`)|
|`match_team_blue_2`|Integer|Foreign key (`team(team_id)`)|
|`match_score_red`|Integer||
|`match_score_blue`|Integer||

Match round, number, and instance can be confusing. Round refers to the match type; see below. Number refers to the match number within that round (e.g., 'Qualification 15'). Instance is used only within elimination brackets (e.g., 'Quarterfinal 1-2', where the first number is its instance).

|Round|Match type|
|---|---|
|1|Practice|
|2|Qualification|
|3|Quarterfinal|
|4|Semifinal|
|5|Final (VEX V5 Robotics Competition)|
|6|Round of 16|
|15|Final (VEX IQ Robotics Competition)|