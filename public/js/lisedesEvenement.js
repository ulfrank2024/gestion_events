document.addEventListener("DOMContentLoaded", async () => {
    const eventsContainer = document.getElementById("events-container");
    const userId = localStorage.getItem("user_id"); // Vérifier si l'utilisateur est connecté
    const userRole = localStorage.getItem("user_role"); // Récupérer le rôle de l'utilisateur (admin ou participant)

    try {
        const response = await fetch("/events");
        if (!response.ok)
            throw new Error("Erreur lors du chargement des événements");

        const evenements = await response.json();

        eventsContainer.innerHTML = evenements
            .map(
                (event) => `
            <div class="blockevenement" data-event-id="${event.id}">
                <img src="${event.image_url}" alt="${event.title}" width="400px" height="300px" />
                <h3>${event.title}</h3>
                <p>Description : ${event.description}</p>
                <p>Date : ${event.date}</p>
                <p>Lieu : ${event.location}</p>
                <p class="message-erreur" style="color: red; display: none;"></p>
                <div class="blockbutton">
                    ${
                        userId && userRole !== "admin" // ✅ Seuls les participants voient le bouton "S'inscrire"
                            ? `<button class="inscriptionEvenement" data-id="${event.id}">S'inscrire</button>`
                            : ""
                    }
                    ${
                        !userId // ✅ Si l'utilisateur n'est pas connecté, afficher un bouton de connexion
                            ? `<button class="redirectConnexion">S'inscrire</button>`
                            : ""
                    }
                    <button class="voirevenement" data-id="${event.id}">Voir</button>
                </div>
            </div>
        `
            )
            .join("");

        // Redirection si l'utilisateur n'est pas connecté
        document.querySelectorAll(".redirectConnexion").forEach((button) => {
            button.addEventListener("click", () => {
                window.location.href = "/connexion"; // Rediriger vers la page de connexion
            });
        });

        // Ajout de l'événement de clic pour chaque bouton "Voir"
        document.querySelectorAll(".voirevenement").forEach((button) => {
            button.addEventListener("click", (event) => {
                const eventId = event.target.getAttribute("data-id");
                window.location.href = `/evenement/${eventId}`; // Redirige vers la page de détails
            });
        });

        // Ajout de l'événement de clic pour les inscriptions
        document.querySelectorAll(".inscriptionEvenement").forEach((button) => {
            button.addEventListener("click", async (event) => {
                const eventId = event.target.getAttribute("data-id");

                try {
                    const response = await fetch("/inscription", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            user_id: userId,
                            event_id: eventId,
                        }),
                    });

                    const responseData = await response.json();
                    const eventCard = document.querySelector(
                        `.blockevenement[data-event-id="${eventId}"]`
                    );
                    const errorMessage =
                        eventCard.querySelector(".message-erreur");

                    if (!response.ok) {
                        errorMessage.textContent =
                            responseData.message ||
                            "Vous êtes déjà inscrit.";
                        errorMessage.style.display = "block";
                        return;
                    }

                    event.target.disabled = true;
                    event.target.textContent = "Déjà inscrit";
                    errorMessage.style.display = "none";
                } catch (error) {
                    console.error("Erreur :", error);
                }
            });
        });
    } catch (error) {
        console.error("Erreur :", error);
        eventsContainer.innerHTML =
            "<p>Impossible de charger les événements.</p>";
    }
});
