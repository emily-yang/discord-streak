/** **********************
 *   Helper functions   *
 *********************** */
const fs = require('fs');
const AppDAO = require('./db/dao');
const PlayerRepository = require('./db/PlayerRepository');
const MatchRepository = require('./db/MatchRepository');

async function getDBConnection(conn, serverId) {
  const connection = conn || (await startConnection(serverId));
  const { playerRepo, matchRepo } = connection;
  if (connection.isNewServer) {
    await createTables(serverId, playerRepo, matchRepo);
  }
  return { playerRepo, matchRepo, connection };
}

function startConnection(serverId) {
  // check if db is for a preexisting server before creating db file
  const isNewServer = !fs.existsSync(`./db/servers/.${serverId}`);

  const dao = new AppDAO(`./db/servers/.${serverId}`);
  const playerRepo = new PlayerRepository(dao);
  const matchRepo = new MatchRepository(dao);
  return { playerRepo, matchRepo, dao, isNewServer };
}

async function createTables(serverId, players, matches) {
  await players.createTable();
  await matches.createTable();
}

async function displayCurrentStreak(channel, players, matches) {
  try {
    const lastMatch = await matches.getLastMatch();
    if (lastMatch) {
      const playerName = (await players.getById(lastMatch.winner)).name;
      channel.send(`*Running streak -  ${playerName}: **${lastMatch.streak}***`);
    }
  } catch (err) {
    console.error(err);
  }
}

async function displayStandings(channel, players) {
  try {
    const sortedPlayers = await players.getPlayersSortedByStreak();
    // // print standings
    const header = `__Standings__\n`;
    const rankings = sortedPlayers.map(player => `${player.name}: **${player.maxstreak}**`).join('\n');
    channel.send(header.concat(rankings));
  } catch (err) {
    console.error(err);
  }
}

module.exports = { getDBConnection, displayCurrentStreak, displayStandings };
