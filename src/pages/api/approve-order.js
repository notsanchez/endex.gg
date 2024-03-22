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
      `
      SELECT TV.MP_ID, TP.FK_USUARIO, TP.PRECO_A_RECEBER, TU.SALDO_DISPONIVEL FROM T_VENDAS TV 
      INNER JOIN T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO
      INNER JOIN T_USUARIOS TU ON TU.id = TP.FK_USUARIO
      WHERE TV.id = "${orderId}"
      `
    );

    const mpId = results?.[0]?.MP_ID;
    const FK_USUARIO = results?.[0]?.FK_USUARIO;
    const PRECO_A_RECEBER = results?.[0]?.PRECO_A_RECEBER;
    const SALDO_DISPONIVEL = results?.[0]?.SALDO_DISPONIVEL;

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
      await connection.execute(
        `UPDATE T_USUARIO
                SET SALDO_DISPONIVEL = '${
                  Number(SALDO_DISPONIVEL) + Number(PRECO_A_RECEBER)
                }'
            WHERE id = ${FK_USUARIO};`
      );
      res.status(200).json({ message: "atualizado com sucesso" });
      await connection.end();
    } else {
      res.status(500).json({ error: "Erro" });
      await connection.end();
    }
  } catch (error) {
    console.error("Erro ao executar a consulta:", error);
    res.status(500).json({ message: "Erro ao executar a consulta" });
  }
}
