import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "srv1182.hstgr.io",
  user: "u547464807_endex",
  password: "Endexlogin@gg123456",
  database: "u547464807_endex",
  port: "3306",
  connectionLimit: 30
});

export default async function handler(req, res) {
  try {
    const connection = await pool.getConnection();

    const { query } = req.body;

    const [results, fields] = await connection.execute(query);

    if (query.trim().toUpperCase().startsWith("INSERT")) {
      const matches = query.match(/INSERT INTO (\w+)/i);
      if (matches && matches.length > 1) {
        const tableName = matches[1];

        var insertedId;

        if (results.insertId == 0) {
          const [rows] = await connection.execute(
            `SELECT id FROM ${tableName} ORDER BY created_at DESC LIMIT 1`
          );
          insertedId = rows[0].id;
        } else {
          insertedId = results.insertId;
        }

        const [insertedResults, _] = await connection.execute(
          `SELECT * FROM ${tableName} WHERE id = ?`,
          [insertedId]
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

    connection.release();
  } catch (error) {
    console.error("Erro ao executar a consulta:", error);
    res.status(500).json({ message: "Erro ao executar a consulta" });
  }
}
