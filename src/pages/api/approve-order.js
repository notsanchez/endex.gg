import axios from "axios";
import mysql from "mysql2/promise"; // Importa a biblioteca mysql2/promise

export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection({
      host: "monorail.proxy.rlwy.net",
      user: "root",
      password: "erOrrfzknqaRQZsHzsQeyNgoTZSgTvwp",
      database: "railway",
      port: "13849",
    });

    const { orderId } = req.query;

    const [results, fields] = await connection.execute(
      `SELECT MP_ID FROM T_VENDAS WHERE id = "${orderId}"`
    );

    const mpId = results?.[0]?.MP_ID;

    const { data } = await axios.get(
      `https://api.mercadopago.com/v1/payments/${mpId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer APP_USR-3995123121538722-032120-1f105087653c6b4a3a697f342559a57d-1057256088",
        },
      }
    );

    if (data.status === "approved") {
      await connection.execute(
        `UPDATE T_VENDAS
                SET FK_STATUS = '2'
            WHERE id = ${orderId};`
      );
      res.status(200).json({ message: "atualizado com sucesso" });
      await connection.end()
    } else {
      res.status(500).json({ error: "Erro" });
      await connection.end()
    }

  } catch (error) {
    console.error("Erro ao executar a consulta:", error);
    res.status(500).json({ message: "Erro ao executar a consulta" });
  }
}
