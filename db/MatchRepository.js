class MatchRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      streak INTEGER,
      winner TEXT references PLAYERS(id),
      datetime TEXT
    `;
    return this.dao.run(sql);
  }

  create(id, streak, winner) {
    return this.dao.run(
      `INSERT INTO matches (id, streak, winner, datetime)
      VALUES (?, ?, ?, DATETIME('now'))`,
      [id, streak, winner]
    );
  }
}

module.exports = MatchRepository;
