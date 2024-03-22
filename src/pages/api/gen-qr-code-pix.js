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

    const resQrCode = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      {
        transaction_amount: req?.body?.price,
        description: "Endex - Serviços Digitais",
        external_reference: req?.body?.external_id,
        payment_method_id: "pix",
        notification_url: `https://endex-gg.vercel.app/api/approve-order?orderId=${req?.body?.external_id}`,
        payer: {
          email: "soloqmatheus@gmail.com",
          first_name: "Matheus",
          last_name: "Machado",
          identification: {
            type: "CPF",
            number: "52723079848",
          },
        },
      },
      {
        headers: {
          Authorization:
            "Bearer APP_USR-3995123121538722-032120-1f105087653c6b4a3a697f342559a57d-1057256088",
        },
      }
    );

    await connection.execute(`
        UPDATE T_VENDAS
            SET MP_ID = '${resQrCode?.data?.id}'
        WHERE id = ${req?.body?.external_id};
    `);

    await connection.end()

    res.status(200).json({
      qrcode:
        resQrCode?.data?.point_of_interaction?.transaction_data?.qr_code_base64,
    });
  } catch (error) {
    console.error("Erro ao executar a consulta:", error);
    res.status(500).json({ message: "Erro ao executar a consulta" });
  }
}
