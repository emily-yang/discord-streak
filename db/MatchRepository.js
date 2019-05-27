class MatchRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS matches (
      streak INTEGER,
      winner TEXT references PLAYERS(id),
      datetime TEXT
    `;
    return this.dao.run(sql);
  }

  create(streak, winner) {
    return this.dao.run(
      `INSERT INTO matches (streak, winner, datetime)
      VALUES (?, ?, DATETIME('now'))`,
      [streak, winner]
    );
  }
}

module.exports = MatchRepository;
