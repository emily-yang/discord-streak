/** **********************
 *   Helper functions   *
 *********************** */
const fs = require('fs');
const AppDAO = require('./db/dao');
const PlayerRepository = require('./db/PlayerRepository');
const MatchRepository = require('./db/MatchRepository');

async function startConnection(serverId) {
  try {
    const dao = new AppDAO(`./db/.${serverId}`);
    const playerRepo = new PlayerRepository(dao);
    const matchRepo = new MatchRepository(dao);

    const dbExists = fs.existsSync(`./db/.${serverId}`);
    if (!fs.existsSync(`./db/.${serverId}`)) {
      await playerRepo.createTable();
      await matchRepo.createTable();
    }
    return { playerRepo, matchRepo };
  } catch (err) {
    console.error(err);
  }

  return { playerRepo, matchRepo };
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

module.exports = { startConnection, displayCurrentStreak, displayStandings };
