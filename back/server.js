require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/send-email", async (req, res) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: "destinataire@example.com",
        subject: "Nouveau message de contact",
        text: `Email: ${email}\nMessage: ${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email envoyé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
    }
});

app.get("/", (req, res) => {
    res.send("Le serveur fonctionne correctement ! 🚀");
});


app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
