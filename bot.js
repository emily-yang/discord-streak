/* eslint-disable spaced-comment */
require('dotenv').config();
const { Client } = require('discord.js');
const Database = require('./db/Database');

const db = new Database('discord-streak');

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({ game: { name: 'Enter !!help for usage' }, status: 'online' }).catch(console.error);
});

client.login(process.env.BOT_TOKEN);

client.on('message', async message => {
  const { content, channel } = message;
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
      '\nUsage:\n**!!winner *@username***  - report a match winner \n**!!standings** - view the standings \n**!!addplayer *@username*** - add a player to the standings \n**!!reset**  - reset the standings '
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
    // Turn on bot checking
    if (winner.bot) {
      channel.send('Error: winner cannot be a :robot:. Sorry, bot!');
      return;
    }

    // add player if not in db
    const player = (await db.findPlayer(winner.id)) || (await db.addPlayer(winner.id, winner.username));
    // update report
    const report = await db.addReport(player.userId, player.userName, message.author.id);
    // update player if current streak is higher than their highest streak
    if (report.streak > player.maxStreak) {
      const updated = await db.updatePlayerMaxStreak(player.userId);
    }
    // confirm win in channel
    channel.send(`Win recorded for ${winner}`);

    // post updated streak and standings
    await displayCurrentStreak(channel);
    await displayStandings(channel);
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
    // check that a user was given
    const newPlayer = message.mentions.users.first();

    if (!newPlayer) {
      channel.send('Error: must include a valid user\nUsage: *!!addplayer @username*');
      return;
    }
    //  Turn on bot checking
    if (newPlayer.bot) {
      channel.send('Error: player cannot be a :robot:. Sorry, bot!');
      return;
    }
    // add player if not in db

    const playerLookup = await db.findPlayer(newPlayer.id);
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
   *   Handle !!undoreport command   *
   **********************************/
  if (content === '!!undoreport') {
    channel.send('Feature to undo last report coming soon!');
    // confirm cancel
    // cancel last report
    // post current streak
  }

  /*****************************
   *   Handle !!reset command   *
   *****************************/
  if (content === '!!reset') {
    // TODO: confirm user wants to reset
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
async function displayCurrentStreak(channel) {
  // get current streak from last report
  const streak = await db.getLastReport();
  if (streak) channel.send(`*Running streak -  ${streak.winner.userName}: **${streak.streak}***`);
}

async function displayStandings(channel) {
  // get all standings
  const sorted = await db.getSortedPlayers();

  // respond if standings are empty
  if (sorted.length === 0) {
    channel.send('Standings are empty right now. Make a report!');
    return;
  }

  // print standings
  const header = `__Standings__\n`;
  const rankings = sorted.map(player => `${player.userName}: **${player.maxStreak}**`).join('\n');
  channel.send(header.concat(rankings));
}
