import axios from "axios";
import mysql from "mysql2/promise";

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
        SELECT TV.MP_ID, TV.FK_USUARIO_COMPRADOR, TU.id as FK_USUARIO_VENDEDOR, TP.PRIMEIRA_MENSAGEM FROM T_VENDAS TV
        LEFT JOIN T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO
        LEFT JOIN T_USUARIOS TU ON TU.id = TP.FK_USUARIO
        WHERE TV.id = "${orderId}"
      `
    );

    const mpId = results?.[0]?.MP_ID;
    const FK_USUARIO_COMPRADOR = results?.[0]?.FK_USUARIO_COMPRADOR;
    const FK_USUARIO_VENDEDOR = results?.[0]?.FK_USUARIO_VENDEDOR;
    const PRIMEIRA_MENSAGEM = results?.[0]?.PRIMEIRA_MENSAGEM;

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
        `INSERT INTO T_NOTIFICACOES (FK_USUARIO, MENSAGEM) VALUES ("${FK_USUARIO_VENDEDOR}", "Você possui uma nova venda! <br/> <span style="color: #8234E9">clique aqui</span> para ver os detalhes 🏆")`
      );
      await connection.execute(
        `INSERT INTO T_NOTIFICACOES (FK_USUARIO, MENSAGEM) VALUES ("${FK_USUARIO_COMPRADOR}", "Sua compra acaba de ser aprovada! <br/> <span style="color: #8234E9">clique aqui</span> para ver os detalhes 🏆")`
      );
      if(!!PRIMEIRA_MENSAGEM){
        await connection.execute(
          `INSERT INTO T_MENSAGENS_VENDA (FK_USUARIO, FK_VENDA, MENSAGEM) VALUES ("${FK_USUARIO_VENDEDOR}", "${orderId}", "${PRIMEIRA_MENSAGEM}")`
        );
      }
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
