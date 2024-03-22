import mysql from "mysql2/promise"

export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection({
      host: "monorail.proxy.rlwy.net",
      user: "root",
      password: "erOrrfzknqaRQZsHzsQeyNgoTZSgTvwp",
      database: "railway",
      port: "13849"
    });

    const { query } = req.body;

    const [results, fields] = await connection.execute(query);

    if (query.trim().toUpperCase().startsWith("INSERT")) {
      const matches = query.match(/INSERT INTO (\w+)/i);
      if (matches && matches.length > 1) {
        const tableName = matches[1];
        const [insertedResults, _] = await connection.execute(
          `SELECT * FROM ${tableName} WHERE id = ?`,
          [results.insertId]
        );
        res.status(200).json({ results: insertedResults });
      } else {
        console.error("Erro ao determinar o nome da tabela");
        res
          .status(500)
          .json({ message: "Erro ao determinar o nome da tabela" });
      }
    } else {
      res.status(200).json({ results });
    }

    await connection.end();
  } catch (error) {
    console.error("Erro ao executar a consulta:", error);
    res.status(500).json({ message: "Erro ao executar a consulta" });
  }
}
