class PlayerRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY
      name TEXT
    `;
    return this.dao.run(sql);
  }

  create(id, name) {
    return this.dao.run(
      `INSERT INTO players (id, name)
      VALUES (?,?)`,
      [id, name]
    );
  }
}

module.exports = PlayerRepository;
