import mysql from 'mysql';

export default async function handler(req, res) {
  const connection = mysql.createConnection({
    host: "bxascrm8jwtnvrrtozec-mysql.services.clever-cloud.com",
    user: "uuznrkybaperfe1z",
    password: "k42pwznjGjETh2GqpQjb",
    database: "bxascrm8jwtnvrrtozec",
  });

  connection.connect((err) => {
    if (err) {
      console.error("Erro ao conectar ao banco de dados:", err);
      res.status(500).json({ message: "Erro ao conectar ao banco de dados" });
      return;
    }
  });

  if (req.method === "POST") {
    const { query } = req.body;

    connection.query(query, (error, results, fields) => {
      if (error) {
        console.error("Erro ao executar a consulta:", error);
        res.status(500).json({ message: "Erro ao executar a consulta" });
        connection.end();
        return;
      }

      if (query.trim().toUpperCase().startsWith("INSERT")) {
        const matches = query.match(/INSERT INTO (\w+)/i);
        if (matches && matches.length > 1) {
          const tableName = matches[1];
          connection.query(`SELECT * FROM ${tableName} WHERE id = ?`, results.insertId, (error, insertedResults, fields) => {
            if (error) {
              console.error("Erro ao obter os dados do registro inserido:", error);
              res.status(500).json({ message: "Erro ao obter os dados do registro inserido" });
              connection.end();
              return;
            }
            res.status(200).json({ results: insertedResults });
            connection.end();
          });
        } else {
          console.error("Erro ao determinar o nome da tabela");
          res.status(500).json({ message: "Erro ao determinar o nome da tabela" });
          connection.end();
        }
      } else {
        res.status(200).json({ results });
        connection.end();
      }
    });
  } else {
    res.status(405).end();
  }
}
