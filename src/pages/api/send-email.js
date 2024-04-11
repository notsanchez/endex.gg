import nodemailer from "nodemailer";

export default async function handler(req, res) {
  try {
    const email = req.body.email;
    const user_id = req.body.user_id;

    if (!email) {
      return res.status(500).json({ message: "Erro ao executar a consulta" });
    }

    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["host"];
    const currentUrl = `${protocol}://${host}`;

    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "suporte.endexgg@hotmail.com",
        pass: "endexlogin@gg",
      },
    });

    await transporter.sendMail({
      text: "Confirmação de conta - ENDEX",
      subject: "Confirme sua conta clicando no link - ENDEX",
      from: "Endex <suporte.endexgg@hotmail.com",
      to: [email],
      html: `
        <html>
            <body>
                <strong>Clique no link para verificar sua conta:</strong></br>
                <a href="${currentUrl}/verify-account/${user_id}">${currentUrl}/verify-account/${user_id}</a>
            </body>
        </html> 
        `,
    });

    return res.status(200).json({ message: "E-mail enviado com sucesso" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro ao executar a consulta" });
  }
}
