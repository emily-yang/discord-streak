async function displayCurrentStreak(db, channel) {
  // get current streak from last report
  const streak = await db.getLastReport();
  if (streak) channel.send(`*Running streak -  ${streak.winner.userName}: **${streak.streak}***`);
}

async function displayStandings(db, channel) {
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

module.exports = { displayCurrentStreak, displayStandings };
