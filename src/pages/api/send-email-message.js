import nodemailer from "nodemailer";
import mysql from "mysql2/promise";

export default async function handler(req, res) {
    try {

        const email = req.body.email;

        if (!email) {
            return res.status(500).json({ message: "Erro ao executar a consulta" });
        }

        const transporter = nodemailer.createTransport(
            {
                service: "hotmail",
                auth: {
                    user: "suporte.endexgg@hotmail.com",
                    pass: "endexlogin@gg",
                },
            }
        );

        await transporter.sendMail({
            text: "ENDEX - Você recebeu uma nova mensagem",
            subject: "ENDEX - Você recebeu uma nova mensagem",
            from: "Endex <suporte.endexgg@hotmail.com",
            to: [email],
            html: `
        <html>
            <body>
                <h1>Você recebeu uma nova mensagem em uma venda</h1></br>
                <strong>Encontre suas mensagens</strong>
                <a href="https://endexgg.com">AQUI</a>
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
