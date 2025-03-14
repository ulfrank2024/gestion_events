import { existsSync, unlinkSync } from "fs";
import { connexion } from "../db/db.js";
import {createNotification} from "../model/notification.js"
// fonction pour creer un evenement
export async function createEvent(
    title,
    description,
    date,
    location,
    organizer_id,
    image_url
) {
    // Vérifier si un événement existe déjà à la même date et dans la même salle
    const existingEvent = await connexion.get(
        "SELECT id, title FROM events WHERE date = ? AND location = ?",
        [date, location]
    );

    if (existingEvent) {
        // Envoyer une notification à l'organisateur
        await createNotification(
            organizer_id,
            `La salle est déjà réservée pour l'événement "${existingEvent.title}" à cette date.`
        );

        throw new Error(
            "Impossible de créer l'événement : la salle est déjà réservée à cette date."
        );
    }

    // Insérer le nouvel événement
    await connexion.run(
        "INSERT INTO events (title, description, date, location, organizer_id, image_url) VALUES (?, ?, ?, ?, ?, ?)",
        [title, description, date, location, organizer_id, image_url]
    );

    // Ajouter une notification pour l'organisateur
    await createNotification(
        organizer_id,
        `Un nouvel événement a été créé : ${title}`
    );
}

//fonction pour recuperer tous les element
export async function GetAllEvent() {
    try {
        const events = await connexion.all("SELECT * FROM events");
        return events;
    } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
        throw error;
    }
}
// fonction pour delet un evenement
// Fonction pour supprimer un événement
export async function DeletEvent(id) {
    try {
        console.log(`🔍 Suppression de l'événement ID : ${id}`);

        // Vérifier si l'événement existe
        const event = await connexion.get("SELECT * FROM events WHERE id = ?", [id]);
        if (!event) {
            console.log("⚠️ Événement introuvable.");
            return { success: false, message: "Événement introuvable" };
        }

        console.log("📌 Événement trouvé :", event);

        // Supprimer l'image si elle existe
        if (event.image_url && existsSync(event.image_url)) {
            unlinkSync(event.image_url);
            console.log("🖼️ Image supprimée :", event.image_url);
        }

        // Supprimer l'événement
        await connexion.run("DELETE FROM events WHERE id = ?", [id]);
        console.log("✅ Événement supprimé de la base de données.");

        // Ajouter une notification pour l'organisateur
        await createNotification(event.organizer_id, `L'événement "${event.title}" a été supprimé.`);
        console.log("📩 Notification envoyée.");

        return { success: true, message: "Événement supprimé" };
    } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'événement :", error);
        return { success: false, message: "Erreur serveur" };
    }
}

//*****fonction pour modifier un evenement */
export async function updateEvent(
    eventId,
    title,
    description,
    date,
    location,
    image_url
) {
    try {
        // Vérifier si l'événement existe
        const event = await connexion.get("SELECT * FROM events WHERE id = ?", [
            eventId,
        ]);

        if (!event) {
            console.error("Événement non trouvé dans la base de données !");
            return null;
        }

        // Mise à jour de l'événement
        const result = await connexion.run(
            "UPDATE events SET title = ?, description = ?, date = ?, location = ?, image_url = ? WHERE id = ?",
            [title, description, date, location, image_url, eventId]
        );
        // Ajouter une notification pour l'organisateur
        await createNotification(
            event.organizer_id,
            `l'événement "${title}" a été modifié.`
        );

        // Vérification si une ligne a été modifiée
        if (result.changes === 0) {
            console.error("Aucune modification effectuée !");
            return null;
        }

        return { id: eventId, title, description, date, location, image_url };
    } catch (error) {
        console.error("Erreur lors de la modification de l'événement :", error);
        throw error;
    }
}

// Fonction pour récupérer un événement par ID
// Fonction pour récupérer un événement par ID
export async function GetEventById(id) {
    try {
        // Utilisation de la connexion directement, sans openDb()
        const event = await connexion.get("SELECT * FROM events WHERE id = ?", [
            id,
        ]);
        return event;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'événement :", error);
        throw error;
    }
}

// Fonction pour compter le nombre d'événements auxquels un étudiant est inscrit
export async function getEventCountForStudent(user_id) {
    try {
        const result = await connexion.get(
            "SELECT COUNT(*) AS event_count FROM participants WHERE user_id = ? AND status = 'inscrit'",
            [user_id]
        );
        return result.event_count;
    } catch (error) {
        console.error(
            "Erreur lors du comptage des événements de l'étudiant :",
            error
        );
        throw error;
    }
}

// Fonction pour compter le nombre total d'étudiants
export async function getTotalStudents() {
    try {
        const result = await connexion.get(
            "SELECT COUNT(*) AS student_count FROM users WHERE role = 'participant'"
        );
        return result.student_count;
    } catch (error) {
        console.error("Erreur lors du comptage des étudiants :", error);
        throw error;
    }
}

// Fonction pour compter le nombre total d'événements enregistrés
export async function getTotalEvents() {
    try {
        const result = await connexion.get(
            "SELECT COUNT(*) AS event_count FROM events"
        );
        return result.event_count;
    } catch (error) {
        console.error("Erreur lors du comptage des événements :", error);
        throw error;
    }
}
//fonction qui permet de récupérer un événement par son ID 
export async function GetEventDetailsById(id) {
    try {
        const event = await connexion.get("SELECT * FROM events WHERE id = ?", [
            id,
        ]);
        return event;
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des détails de l'événement :",
            error
        );
        throw error;
    }
}
export async function checkIfEventExists(date, location) {
    try {
        const event = await connexion.get(
            "SELECT * FROM events WHERE date = ? AND location = ?",
            [date, location]
        );

        return event
    } catch (error) {
        console.error("Erreur lors de la vérification de l'événement :", error);
        throw error;
    }
}