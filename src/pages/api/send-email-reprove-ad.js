import nodemailer from "nodemailer";
import mysql from "mysql2/promise";

export default async function handler(req, res) {
    try {

        const email = req.body.email;
        const motivo = req.body.motivo;

        if (!email) {
            return res.status(500).json({ message: "Erro ao executar a consulta" });
        } else if (!motivo) {
            return res.status(500).json({ message: "Erro ao executar a consulta" });
        }


        const transporter = nodemailer.createTransport({
            service: "hotmail",
            auth: {
                user: "suporte.endexgg@hotmail.com",
                pass: "endexlogin@gg",
            },
        });

        await transporter.sendMail({
            text: "Anúncio reprovado - ENDEX",
            subject: "Anúncio reprovado - ENDEX",
            from: "Endex <suporte.endexgg@hotmail.com",
            to: [email],
            html: `
        <html>
            <body>
                <h1>Seu anúncio em endexgg.com foi reprovado pelo seguinto motivo:</h1></br>
                <strong>${motivo}</strong>
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
