const fetchNotifications = async () => {
    try {
        console.log(
            `📡 Requête API envoyée à : /profil/${userId}/notifications`
        );

        const response = await fetch(`/profil/${userId}/notifications`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok)
            throw new Error(
                `Erreur HTTP: ${response.status} - ${response.statusText}`
            );

        const notifications = await response.json();
        console.log(`📌 Notifications récupérées :`, notifications);

        if (!Array.isArray(notifications) || notifications.length === 0) {
            notificationContainer.innerHTML = "<p>Aucune notification.</p>";
            return;
        }

        // ✅ Sélectionner uniquement la dernière notification
        const latestNotification = notifications[notifications.length - 1];

        console.log(
            `🔔 Dernière notification à afficher : ${latestNotification.message}`
        );

        // Vérifier si une notification est déjà affichée
        let existingNotif = document.querySelector(".notification");

        if (!existingNotif) {
            // ✅ Si aucune notification affichée, on la crée
            existingNotif = document.createElement("div");
            existingNotif.classList.add("notification");
            notificationContainer.appendChild(existingNotif);
        }

        // ✅ Mettre à jour le contenu au lieu d'ajouter un nouveau bloc
        existingNotif.innerHTML = `
            <p>${latestNotification.message}</p>
            <button class="buttondelet" data-id="${latestNotification.id}">X</button>
        `;

        addDeleteEventListeners(); // Ajouter l'événement de suppression
    } catch (error) {
        console.error(
            "❌ Erreur lors du chargement des notifications :",
            error
        );
    }
};

const addDeleteEventListeners = () => {
    const deleteButton = document.querySelector(".buttondelet");
    if (deleteButton) {
        deleteButton.addEventListener("click", async (event) => {
            const notificationId = event.target.getAttribute("data-id");

            try {
                console.log(
                    `🗑️ Suppression de la notification ID: ${notificationId}`
                );

                const response = await fetch(
                    `/api/notifications/${notificationId}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getToken()}`,
                        },
                    }
                );

                if (!response.ok)
                    throw new Error(`Erreur HTTP: ${response.status}`);

                // ✅ Supprimer la notification affichée
                document.querySelector(".notification").remove();
                console.log(`✅ Notification supprimée : ${notificationId}`);
            } catch (error) {
                console.error(
                    "❌ Erreur lors de la suppression de la notification :",
                    error
                );
            }
        });
    }
};

fetchNotifications(); // Charger les notifications au démarrage
