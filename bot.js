/* eslint-disable spaced-comment */
require('dotenv').config();
const { Client } = require('discord.js');

const http = require('http');
const fs = require('fs');
const express = require('express');

const { startConnection, displayCurrentStreak, displayStandings } = require('./helpers');

// const app = express();
// app.get('/', (request, response) => {
//   console.log(`${Date.now()} Ping Received`);
//   response.sendStatus(200);
// });
// app.listen(process.env.PORT);
// setInterval(() => {
//   http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
// }, 280000);

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({ game: { name: '!!help for usage' }, status: 'online' }).catch(console.error);
});

client.login(process.env.BOT_TOKEN);

const disallowBots = false;

client.on('message', async message => {
  const { content, channel } = message;
  const serverId = channel.guild.id;
  const dbExists = fs.existsSync(`./db/.${serverId}`);

  let matches;
  let players;

  // try {
  //   const repos = await startDB(serverId);
  //   matches = repos.matchRepo;
  //   players = repos.playerRepo;

  //   if (!dbExists) {
  //     await players.createTable();
  //     await matches.createTable();
  //   }
  // } catch (err) {
  //   console.error('Error with connecting: ', err);
  // }

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
      const repos = await startConnection(serverId);
      players = repos.playerRepo;
      matches = repos.matchRepo;

      // add player if not in db
      await players.add(winner.id, winner.username);
      // get last match and calculate new streak
      const lastMatch = await matches.getLastMatch();
      const streak = !lastMatch || lastMatch.winner !== winner.id ? 1 : lastMatch.streak + 1;
      // insert new match
      await matches.add(streak, winner.id);

      // // post updated streak and standings
      await displayCurrentStreak(channel, players, matches);
      await displayStandings(channel, players);
    } catch (err) {
      console.error(err);
    }
  }

  /*********************************
   *   Handle !!standings command   *
   *********************************/
  if (content === '!!standings') {
    try {
      const repos = await startConnection(serverId);
      players = repos.playerRepo;
      matches = repos.matchRepo;

      const lastMatch = await matches.getLastMatch();
      // // handle if there are no reports in db
      if (!lastMatch) {
        channel.send('There are no matches reported.');
        return;
      }
      await displayCurrentStreak(channel, players, matches);
      await displayStandings(channel, players);
    } catch (err) {
      console.error(err);
    }
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
    try {
      const repos = await startConnection(serverId);
      players = repos.playerRepo;
      matches = repos.matchRepo;

      const player = await players.getById(newPlayer.id);
      if (player) {
        channel.send(`Player already exists!`);
      } else {
        await players.add(newPlayer.id, newPlayer.username);
        // confirm player addition in channel
        channel.send(`@${newPlayer.username} has been added to the standings`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**********************************
   *   Handle !!cancellast command   *
   **********************************/
  if (content === '!!cancellast') {
    try {
      const repos = await startConnection(serverId);
      players = repos.playerRepo;
      matches = repos.matchRepo;

      // get records
      const lastMatch = await matches.getLastMatch();
      // // handle if there are no reports in db
      if (!lastMatch) {
        channel.send('There are no matches reported!');
        return;
      }

      // delete most recent match
      await matches.deleteLastMatch();
      channel.send('The last report has been deleted');
      // // post current streak and standings
      await displayCurrentStreak(channel, players, matches);
      await displayStandings(channel, players);
    } catch (err) {
      console.error(err);
    }
  }

  /*****************************
   *   Handle !!reset command   *
   *****************************/
  if (content === '!!reset') {
    try {
      const repos = await startConnection(serverId);
      players = repos.playerRepo;
      matches = repos.matchRepo;

      await matches.deleteAllMatches();
      await players.deleteAllPlayers();
      // send reset message
      channel.send('Standings have been reset');
    } catch (err) {
      console.error(err);
    }
  }
});
