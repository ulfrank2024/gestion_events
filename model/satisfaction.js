import { connexion } from "../db/db.js";

// Fonction pour récupérer la moyenne des notes et le nombre d'avis
export async function siteSatisfaction() {
    try {
        // Utiliser `connexion.all()` pour récupérer toutes les lignes
        const result = await connexion.all(
            `SELECT rating AS category, COUNT(*) AS count 
             FROM site_satisfaction 
             WHERE event_id IS NULL 
             GROUP BY rating` // Filtrer uniquement les évaluations globales
        );
        return result; // Renvoie un tableau des résultats
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des évaluations",
            error.message
        );
        return null;
    }
}

// Fonction pour enregistrer la satisfaction du site
export async function ateSiteSatisfaction(user_id, rating) {
    try {
        const result = await connexion.run(
            `INSERT INTO site_satisfaction (user_id, rating, event_id) 
             VALUES (?, ?, NULL)`, // NULL pour event_id si c'est une évaluation globale
            [user_id, rating]
        );
        return result;
    } catch (error) {
        console.error(
            "Erreur lors de l'enregistrement de la satisfaction",
            error.message
        );
        return null;
    }
}
