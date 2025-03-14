async function getUserId() {
    let userId = localStorage.getItem("user_id");

    if (!userId) {
        console.warn("⚠️ Aucun user_id trouvé dans localStorage, tentative avec le token...");
        userId = await getUserIdFromToken();

        if (userId) {
            console.log("✅ ID utilisateur trouvé via le token :", userId);
            localStorage.setItem("user_id", userId); // Stocker pour éviter de refaire le décodage
        } else {
            console.error("❌ Impossible de récupérer l'ID utilisateur.");
            return null;
        }
    } else {
        console.log("✅ ID utilisateur trouvé dans localStorage :", userId);
    }

    return userId;
}

async function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("❌ Aucun token trouvé !");
        return null;
    }

    try {
        const decoded = JSON.parse(window.atob(token.split(".")[1])); // Décodage JWT
        console.log("🔍 Données décodées :", decoded);
        return decoded.id || decoded.user_id; // Vérifie bien si c'est `id` ou `user_id`
    } catch (error) {
        console.error("❌ Erreur de décodage du token :", error);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("📢 Script chargé !");
    console.log("🎯 LocalStorage user_id :", localStorage.getItem("user_id"));
    console.log("🎯 LocalStorage token :", localStorage.getItem("token"));

    const userId = await getUserId();
    if (!userId) {
        console.error("❌ Impossible de récupérer l'ID utilisateur.");
        return;
    }

    try {
        const response = await fetch(`/api/mes-evenements/${userId}`);
        console.log("📡 Requête API envoyée à :", `/api/mes-evenements/${userId}`);
        if (!response.ok) {
            throw new Error(
                `Erreur lors du chargement des événements: ${response.status} - ${response.statusText}`
            );
        }

        // 🔍 Vérifie la réponse avant de la convertir en JSON
        const responseData = await response.text();
        console.log("📥 Réponse brute de l'API :", responseData);

        const { eventCount, events } = JSON.parse(responseData);
        console.log("📊 Données reçues :", eventCount, events);

        if (!Array.isArray(events)) {
            console.error("❌ Format de données incorrect :", events);
            return;
        }

        // Mise à jour du nombre d'événements
        const eventCountElement = document.querySelector(
            ".elemetdasbordparticipant p.nombre-evenements"
        );
        if (eventCountElement) {
            eventCountElement.textContent = eventCount;
        } else {
            console.warn("⚠️ Élément du compteur d'événements non trouvé.");
        }

        // Affichage des événements
        const eventsContainer = document.getElementById("events-container");
        if (!eventsContainer) {
            console.error("❌ Élément 'events-container' introuvable !");
            return;
        }

        eventsContainer.innerHTML = "";

        events.forEach((event) => {
            const eventElement = document.createElement("div");
            eventElement.classList.add("blockevenement");
            eventElement.setAttribute("data-id", event.id);

            // Vérifier et ajuster l'URL de l'image
            let imageUrl = event.image_url;
            if (!imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
                imageUrl = `/uploads/${imageUrl}`;
            }

            eventElement.innerHTML = `
                <img src="${imageUrl}" alt="${event.title}" width="400px" height="300px" />
                <h3>${event.title}</h3>
                <p class="evementDescrip">Description : ${event.description}</p>
                <p>Date : ${event.date}</p>
                <p>Lieu : ${event.location}</p>
                <div class="blockbutton">
                    <button class="creerevenementbloc" data-id="${event.id}" data-action="voir">Voir</button>
                    <button class="creerevenementbloc" data-id="${event.id}" data-action="annuler-inscription">Annuler</button>
                </div>
            `;

            console.log("✅ Événement ajouté :", eventElement.innerHTML);

            eventsContainer.appendChild(eventElement);
        });

        // Ajout des événements sur les boutons
        document.querySelectorAll(".creerevenementbloc").forEach((button) => {
            button.addEventListener("click", async function () {
                const eventId = this.getAttribute("data-id");
                const action = this.getAttribute("data-action");

                console.log(
                    `🖱️ Bouton cliqué - Action : ${action}, ID Événement : ${eventId}`
                );

                if (action === "voir") {
                    window.location.href = `/evenement/${eventId}`;
                } else if (action === "annuler-inscription") {
                    console.log("📤 Envoi de la requête d'annulation...");
                    try {
                        const cancelResponse = await fetch("/api/annulation", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                user_id: userId,
                                event_id: eventId,
                            }),
                        });

                        if (!cancelResponse.ok) {
                            throw new Error(
                                `Erreur lors de l'annulation : ${cancelResponse.statusText}`
                            );
                        }

                        console.log("🔄 Rechargement de la page...");
                        location.reload();
                    } catch (error) {
                        console.error(
                            "❌ Erreur lors de l'annulation :",
                            error
                        );
                    }
                }
            });
        });
    } catch (error) {
        console.error("❌ Erreur lors du chargement des données :", error);
    }
});
