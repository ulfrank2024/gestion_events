import { connexion } from "../db/db.js";

// ✅ Fonction pour créer une notification avec un timestamp
export async function createNotification(user_id, message) {
    await connexion.run(
        "INSERT INTO notifications (user_id, message, sent_at) VALUES (?, ?, datetime('now'))",
        [user_id, message]
    );
    console.log("✅ Notification insérée :", { user_id, message });
}



export async function getNotifications(user_id) {
    console.log("🔍 Vérification user_id:", user_id);
    const notifications = await connexion.all(
        "SELECT id, user_id, message, sent_at FROM notifications WHERE user_id = ? ORDER BY sent_at DESC",
        [user_id]
    );
  
    return notifications;
}


// ✅ Fonction pour supprimer une notification par ID
export async function deleteNotification(notification_id) {
    try {
        await connexion.run("DELETE FROM notifications WHERE id = ?", [
            notification_id,
        ]);
        console.log("✅ Notification supprimée avec succès !");
    } catch (error) {
        console.error(
            "❌ Erreur lors de la suppression de la notification :",
            error
        );
    }
}


