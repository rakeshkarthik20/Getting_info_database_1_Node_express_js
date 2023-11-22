const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server is running on http://localhost:3000")
    );
  } catch (e) {
    console.log(`Db error ${e.message}`);
    process.exit(1);
  }
};

initialize();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const query = `
    SELECT * FROM cricket_team
  `;
  const players = await db.all(query);
  response.send(
    players.map((player) => convertDbObjectToResponseObject(player))
  );
});

app.post("/players/", async (request, response) => {
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const query = `
    INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES ('${playerName}', ${jerseyNumber}, '${role}')
  `;
  await db.run(query);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId}
  `;
  const player = await db.get(query);
  response.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const query = `
    UPDATE cricket_team
    SET player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}'
    WHERE player_id = ${playerId}
  `;
  await db.run(query);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `
    DELETE FROM cricket_team WHERE player_id = ${playerId}
  `;
  await db.run(query);
  response.send("Player Removed");
});

module.exports = app;
