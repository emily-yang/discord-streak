/* eslint-disable spaced-comment */
require('dotenv').config();
const { Client } = require('discord.js');

const http = require('http');
const express = require('express');
const Database = require('./db/Database');
const { displayCurrentStreak, displayStandings } = require('./helpers');

const app = express();
app.get('/', (request, response) => {
  console.log(`${Date.now()} Ping Received`);
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const db = new Database('process.env.DB_NAME');

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({ game: { name: 'Enter !!help for usage' }, status: 'online' }).catch(console.error);
});

client.login(process.env.BOT_TOKEN);

const disallowBots = true;

client.on('message', async message => {
  const { content, channel, reply } = message;

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

    // add player if not in db
    const player = (await db.getPlayer(winner.id)) || (await db.addPlayer(winner.id, winner.username));
    // update report
    const report = await db.addReport(player.userId, player.userName, message.author.id);
    // update player if current streak is higher than their highest streak
    if (report.streak > player.maxStreak) {
      await db.incPlayerMaxStreak(player.userId, report.id);
    }
    // confirm win in channel
    channel.send(`Win recorded for ${winner}`);

    // post updated streak and standings
    await displayCurrentStreak(db, channel);
    await displayStandings(db, channel);

    message.reply(report.id.toString());
  }

  /*********************************
   *   Handle !!standings command   *
   *********************************/
  if (content === '!!standings') {
    await displayCurrentStreak(db, channel);
    await displayStandings(db, channel);
  }

  /*********************************
   *   Handle !!addplayer command   *
   *********************************/
  if (content.match(/^!!addplayer/gi)) {
    // check that a user was given
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

    // add player if not in db

    const playerLookup = await db.getPlayer(newPlayer.id);
    if (playerLookup) {
      channel.send(`Player already exists!`);
    } else {
      await db.addPlayer(newPlayer.id, newPlayer.username);

      // confirm player addition in channel
      channel.send(`@${newPlayer.username} has been added to the standings`);

      // await displayStandings(channel);
    }
  }

  /**********************************
   *   Handle !!cancellast command   *
   **********************************/
  if (content === '!!cancellast') {
    // get records
    const lastReport = await db.getLastReport();

    // handle if there are no reports in db
    if (!lastReport) {
      channel.send('There are no matches reported!');
      return;
    }

    // decrement player record max streak if last report was a new record
    const lastWinnerId = lastReport.winner.userId;
    const { streakMatches } = await db.getPlayer(lastWinnerId);
    const lastStreakMatch = streakMatches.pop();
    if (lastReport._id.toString() === lastStreakMatch.toString()) {
      await db.decPlayerMaxStreak(lastWinnerId);
    }

    // delete the last report
    await db.deleteLastReport();
    channel.send('The last report has been deleted');

    // post current streak and standings
    await displayCurrentStreak(db, channel);
    await displayStandings(db, channel);

    message.reply(lastReport.id.toString());
  }

  /*****************************
   *   Handle !!reset command   *
   *****************************/
  if (content === '!!reset') {
    // TODO: confirm user wants to reset?
    // set reset flag
    // reset standings
    await db.resetStandings();

    // send reset message
    channel.send('Standings have been reset');
  }
});

/************************
 *   Helper functions   *
 ************************/
// async function displayCurrentStreak(channel) {
//   // get current streak from last report
//   const streak = await db.getLastReport();
//   if (streak) channel.send(`*Running streak -  ${streak.winner.userName}: **${streak.streak}***`);
// }

// async function displayStandings(channel) {
//   // get all standings
//   const sorted = await db.getSortedPlayers();

//   // respond if standings are empty
//   if (sorted.length === 0) {
//     channel.send('Standings are empty right now. Make a report!');
//     return;
//   }

//   // print standings
//   const header = `__Standings__\n`;
//   const rankings = sorted.map(player => `${player.userName}: **${player.maxStreak}**`).join('\n');
//   channel.send(header.concat(rankings));
// }
