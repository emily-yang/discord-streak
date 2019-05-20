require('dotenv').config();
const { Client } = require('discord.js');
const Database = require('./db/Database');

const db = new Database('discord-streak');

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);

client.on('message', async message => {
  const { content, channel } = message;
  /*   if (content === 'ping') {
    // msg.reply('pong');
    message.channel.send('<@579121649945804810>');
  }
 */

  if (content === '!streaker') {
    channel.send(
      '\nUsage:\n**!winner *@username***  - report a match winner \n**!standings** - view the standings \n**!addplayer *@username*** - add a player to the standings \n**!undoreport** - cancel your last report \n**!reset**  - reset the standings '
    );
    return;
  }
  if (content.match(/^!winner/gi)) {
    // check that a user was given
    const winner = message.mentions.users.first();

    if (!winner) {
      channel.send('Error - must include a valid user\n Usage: *!addplayer <@username>*');
      return;
    }
    // TODO: Turn on bot checking
    // if (winner.bot) {
    //   channel.send('Error: winner cannot be a bot. Sorry, bot!');
    //   return;
    // }
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

    await displayStandings(channel);
  }

  if (content === '!standings') {
    await displayStandings(channel);
  }
  //= ==============================================
  if (content.match(/^!addplayer/gi)) {
    // check that a user was given
    const newPlayer = message.mentions.users.first();
    console.log(newPlayer);

    if (!newPlayer) {
      channel.send('Error - must include a valid user\n Usage: *!addplayer <@username>*');
      return;
    }
    // TODO: Turn on bot checking
    // if (player.bot) {
    //   channel.send('Error: player cannot be a bot. Sorry, bot!');
    //   return;
    // }
    // add player if not in db

    const playerLookup = await db.findPlayer(newPlayer.id);
    if (playerLookup) {
      channel.send(`Player already exists!`);
    } else {
      await db.addPlayer(newPlayer.id, newPlayer.username);

      // confirm player addition in channel
      channel.send(`@${newPlayer.username} has been added`);

      // TODO: post current streak
    }
  }
  //= =================================================

  if (content === '!undoreport') {
    channel.send('Undo last report');
    // confirm cancel
    // cancel last report
    // post current streak
  }

  if (content === '!reset') {
    // TODO: confirm user wants to reset
    // set reset flag
    // reset standings
    await db.resetStandings();

    // send reset message
    channel.send('Standings have been reset');
  }
});

async function displayStandings(channel) {
  // get current streak from last report
  const streak = await db.getLastReport();
  if (streak) channel.send(`*Running streak -  ${streak.winner.userName}: **${streak.streak}***`);

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
