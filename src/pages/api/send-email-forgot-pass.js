import nodemailer from "nodemailer";
import mysql from "mysql2/promise";

export default async function handler(req, res) {
    try {

        const connection = await mysql.createConnection({
            host: "srv1182.hstgr.io",
            user: "u547464807_endex",
            password: "Endexlogin@gg123456",
            database: "u547464807_endex",
            port: "3306",
        });

        const email = req.body.email;

        if (!email) {
            return res.status(500).json({ message: "Erro ao executar a consulta" });
        }

        const [results, fields] = await connection.execute(
            `
          SELECT * FROM T_USUARIOS WHERE EMAIL = "${email}"
        `
        );

        if (!results?.[0]?.ACTIVE) {
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
            text: "Redefinição de senha - ENDEX",
            subject: "Redefina sua senha clicando no link - ENDEX",
            from: "Endex <suporte.endexgg@hotmail.com",
            to: [email],
            html: `
        <html>
            <body>
                <strong>Clique no link para redefinir sua senha:</strong></br>
                <a href="${currentUrl}/forgot-password/${results?.[0]?.id}">${currentUrl}/forgot-password/${results?.[0]?.id}</a>
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
