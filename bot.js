require('dotenv').config();
const { Client } = require('discord.js');

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);

client.on('message', message => {
  const { content, channel } = message;
  /*   if (content === 'ping') {
    // msg.reply('pong');
    message.channel.send('<@579121649945804810>');
  }
 */

  if (content === '!streaker') {
    channel.send(
      '\nUsage:\n**!winner *@username***  - report a match winner \n**!standings** - view the standings \n**!undoreport** - cancel your last report \n**!reset**  - reset the standings '
    );
    return;
  }
  if (content.match(/^!winner/gi)) {
    // check that a user was given
    const winner = message.mentions.users.first();

    if (!winner) {
      channel.send('Error: must include a valid username, like so:\n *!winner @username*');
      return;
    }
    if (winner.bot) {
      channel.send('Error: winner cannot be a bot. Sorry, bot!');
      return;
    }

    // confirm win in channel
    message.channel.send(`Win recorded for ${winner}`);
    // update rankings

    // post current streak
  }

  if (content === '!standings') {
    message.reply('You requested standings');
    // post current streak
    // post highest streak
    // post standings
  }

  if (content === '!undoreport') {
    message.channel.send('Undo last report');
    // confirm cancel
    // cancel last report
    // post current streak
  }

  if (content === '!reset') {
    message.channel.send('Reset the  standings');
    // confirm user wants to reset
    // set reset flag
    // confirm reset
    // reset standings
  }
});
