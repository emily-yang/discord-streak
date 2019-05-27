class MatchRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS matches (
      streak INTEGER,
      winner TEXT references PLAYERS(id),
      timestamp TEXT
    `;
    return this.dao.run(sql);
  }

  add(streak, winner) {
    return this.dao.run(
      `INSERT INTO matches (streak, winner, timestamp)
      VALUES (?, ?, DATETIME('now'))`,
      [streak, winner]
    );
  }

  getLastMatch() {
    return this.dao.get(
      `SELECT * FROM matches
      ORDER BY timestamp DESC
      LIMIT 1`
    );
  }

  deleteLastMatch() {
    return this.dao.run(
      `DELETE FROM matches
      WHERE timestamp =
        (SELECT MAX(datetime) FROM table)`
    );
  }

  deleteAllMatches() {
    return this.dao.run(`DELETE FROM matches`);
  }
}

module.exports = MatchRepository;
