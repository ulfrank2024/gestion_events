import nodemailer from "nodemailer";

// Configuration du transporteur SMTP avec Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ulrichfranklinlontsinobossi@gmail.com", // Remplace par ton adresse Gmail
        pass: "cgoj oppb offl rgqm", // Remplace par ton mot de passe d'application
    },
});

// Fonction pour envoyer un e-mail
export async function sendEmail(to, subject, text) {
    try {
        const info = await transporter.sendMail({
            from: '"School_Event" <ulrichfranklinlontsinobossi@gmail.com>', // Expéditeur
            to, // Destinataire
            subject, // Objet de l'e-mail
            text, // Corps du message
        });

        console.log("📩 E-mail envoyé avec succès ! ID :", info.messageId);
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi de l'e-mail :", error);
    }
}
