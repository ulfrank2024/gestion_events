import { connexion } from "../db/db.js";
import bcrypt from "bcrypt";

// ✅ Récupérer un utilisateur par ID
export async function getUtilisateurById(id_utilisateur) {
    try {
        return await connexion.get(`SELECT * FROM users WHERE id = ?`, [
            id_utilisateur,
        ]);
    } catch (error) {
        console.error(
            "Erreur lors de la récupération de l'utilisateur :",
            error.message
        );
        return null;
    }
}

// ✅ Récupérer un utilisateur par courriel
export async function getUtilisateurByCourriel(courriel) {
    try {
        return await connexion.get(`SELECT * FROM users WHERE email = ?`, [
            courriel,
        ]);
    } catch (error) {
        console.error(
            "Erreur lors de la récupération de l'utilisateur :",
            error.message
        );
        return null;
    }
}

// ✅ Ajouter un utilisateur avec hashage du mot de passe
export async function addUtilisateur(name, email, password, role) {
    try {
        console.log("Mot de passe reçu avant hashage :", password);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Vérifier si l'utilisateur existe déjà
        const utilisateurExistant = await getUtilisateurByCourriel(email);
        if (utilisateurExistant) {
            throw new Error("Un utilisateur avec ce courriel existe déjà.");
        }

        // Insérer l'utilisateur
        const result = await connexion.run(
            `INSERT INTO users (name, email, password_hash, role) 
             VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, role]
        );

        console.log("Nouvel utilisateur ajouté avec l'ID :", result.lastID);
        return result.lastID;
    } catch (error) {
        console.error(
            "Erreur lors de l'ajout d'un utilisateur :",
            error.message
        );
        return null;
    }
}

// ✅ Afficher le profil d'un utilisateur
export async function GetUserProfile(user_id) {
    try {
        return await connexion.get(
            `SELECT id, name, email, role FROM users WHERE id = ?`,
            [user_id]
        );
    } catch (error) {
        console.error(
            "Erreur lors de la récupération du profil :",
            error.message
        );
        return null;
    }
}
