/* eslint-disable spaced-comment */
require('dotenv').config();
const { Client } = require('discord.js');

const http = require('http');
const express = require('express');
// const Database = require('./db/Database');
const AppDAO = require('./db/dao');
const PlayerRepository = require('./db/PlayerRepository');
const MatchRepository = require('./db/MatchRepository');

// const app = express();
// app.get('/', (request, response) => {
//   console.log(`${Date.now()} Ping Received`);
//   response.sendStatus(200);
// });
// app.listen(process.env.PORT);
// setInterval(() => {
//   http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
// }, 280000);

// const db = new Database('discord-streak');
// const db = new Database('discord-streak-test');
const dao = new AppDAO('./db/.data');
const playerRepo = new PlayerRepository(dao);
const matchRepo = new MatchRepository(dao);
playerRepo.createTable();
matchRepo.createTable();

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({ game: { name: '!!help for usage' }, status: 'online' }).catch(console.error);
});

client.login(process.env.BOT_TOKEN);

const disallowBots = false;

client.on('message', async message => {
  const { content, channel, reply } = message;
  /*   if (content === 'ping') {
    // msg.reply('pong');
    message.channel.send('<@579121649945804810>');
  }
 */

  /********************************
   *   Handle !!help command   *
   ********************************/
  if (content === '!!help') {
    channel.send(
      '\nUsage: \n**!!standings** - view the standings \n**!!winner *@username*** - report a match winner \n**!!cancellast** - cancel the last report \n**!!addplayer *@username*** - add a player to the standings \n**!!reset**  - reset the standings '
    );
    return;
  }

  /********************************
   *    Handle !!winner command    *
   ********************************/
  if (content.match(/^!!winner/gi)) {
    // check that a user was given
    const winner = message.mentions.users.first();

    if (!winner) {
      channel.send('Error: must include a valid user\nUsage: *!!winner @username*');
      return;
    }
    // TODO: Turn on bot checking
    if (disallowBots && winner.bot) {
      channel.send('Error: winner cannot be a :robot:. Sorry, bot!');
      return;
    }

    try {
      // add player if not in db
      await playerRepo.add(winner.id, winner.username);
      // get last match and calculate new streak
      const lastMatch = await matchRepo.getLastMatch();
      const streak = !lastMatch || lastMatch.winner !== winner.id ? 1 : lastMatch.streak + 1;
      // insert new match
      await matchRepo.add(streak, winner.id);

      // TODO: remove check
      const addedMatch = await matchRepo.getLastMatch();
      console.log('added match data: ', addedMatch);
    } catch (err) {
      console.error(err);
    }

    // // post updated streak and standings
    await displayCurrentStreak(channel);
    await displayStandings(channel);

    // message.reply(report.id.toString());
  }

  /*********************************
   *   Handle !!standings command   *
   *********************************/
  if (content === '!!standings') {
    await displayCurrentStreak(channel);
    await displayStandings(channel);
  }

  /*********************************
   *   Handle !!addplayer command   *
   *********************************/
  if (content.match(/^!!addplayer/gi)) {
    //   // check that a user was given
    const newPlayer = message.mentions.users.first();
    if (!newPlayer) {
      channel.send('Error: must include a valid user\nUsage: *!!addplayer @username*');
      return;
    }
    //  TODO: Turn on bot checking
    if (disallowBots && newPlayer.bot) {
      channel.send('Error: player cannot be a :robot:. Sorry, bot!');
      return;
    }
    //   // add player if not in db
    const player = await playerRepo.getById(newPlayer.id);
    if (player) {
      channel.send(`Player already exists!`);
    } else {
      await playerRepo.add(newPlayer.id, newPlayer.username);
      // confirm player addition in channel
      channel.send(`@${newPlayer.username} has been added to the standings`);
    }
  }

  /**********************************
   *   Handle !!cancellast command   *
   **********************************/
  if (content === '!!cancellast') {
    // // get records
    // const lastReport = await db.getLastReport();
    // console.log(lastReport);
    // // handle if there are no reports in db
    // if (!lastReport) {
    //   channel.send('There are no matches reported!');
    //   return;
    // }
    // // decrement player record max streak if last report was a new record
    // const lastWinnerId = lastReport.winner.userId;
    // const { streakMatches } = await db.getPlayer(lastWinnerId);
    // const lastStreakMatch = streakMatches.pop();
    // if (lastReport._id.toString() === lastStreakMatch.toString()) {
    //   await db.decPlayerMaxStreak(lastWinnerId);
    // }
    // // delete the last report
    // await db.deleteLastReport();
    // channel.send('The last report has been deleted');
    // // post current streak and standings
    // await displayCurrentStreak(channel);
    // await displayStandings(channel);
    // message.reply(lastReport.id.toString());
  }

  /*****************************
   *   Handle !!reset command   *
   *****************************/
  if (content === '!!reset') {
    // // TODO: confirm user wants to reset
    // // reset standings
    await matchRepo.deleteAllMatches();
    // send reset message
    channel.send('Standings have been reset');
  }
});

/************************
 *   Helper functions   *
 ************************/
async function displayCurrentStreak(channel) {
  try {
    const lastMatch = await matchRepo.getLastMatch();
    if (lastMatch) {
      const playerName = (await playerRepo.getById(lastMatch.winner)).name;
      channel.send(`*Running streak -  ${playerName}: **${lastMatch.streak}***`);
    }
  } catch (err) {
    console.error(err);
  }
}

async function displayStandings(channel) {
  try {
    const players = await playerRepo.getPlayersSortedByStreak();
    // // print standings
    const header = `__Standings__\n`;
    const rankings = players.map(player => `${player.name}: **${player.maxstreak}**`).join('\n');
    channel.send(header.concat(rankings));
  } catch (err) {
    console.error(err);
  }
}
