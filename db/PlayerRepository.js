class PlayerRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT
    )`;
    return this.dao.run(sql);
  }

  add(id, name) {
    return this.dao.run(
      `INSERT INTO players (id, name)
      VALUES (?,?)`,
      [id, name]
    );
  }

  getById(id) {
    return this.dao.get(
      `SELECT * FROM players
      WHERE id = ?`,
      [id]
    );
  }

  getPlayersSortedByStreak() {
    return this.dao.all(
      `SELECT name, IFNULL(streak, 0) AS maxstreak
      FROM players AS p
      LEFT OUTER JOIN
      (SELECT winner, MAX(streak) AS streak FROM matches GROUP BY winner) AS m
      ON m.winner = p.id
      ORDER BY streak DESC`
    );
  }
}

module.exports = PlayerRepository;
